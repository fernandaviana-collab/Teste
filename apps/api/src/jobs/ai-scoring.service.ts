import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiScoringService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(AiScoringService.name);

  constructor() {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here') {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async scoreCandidate(candidateData: any, jobRequirements: any): Promise<{ score: number; reasoning: string }> {
    if (!this.openai) {
      return this.fallbackScore(candidateData, jobRequirements);
    }

    try {
      const prompt = `
Você é um especialista em recrutamento para fast food.
Candidato:
- Nome: ${candidateData.name}
- Experiência: ${candidateData.experience || 'Não informada'}
- Distância da loja: ${candidateData.distanceKm || 'N/A'} km
- Disponibilidade: ${candidateData.availability || 'Não informada'}
- Tempo médio em empregos anteriores: ${candidateData.avgTenure || 'N/A'} meses

Vaga:
- Cargo: ${jobRequirements.title}
- Tipo: ${jobRequirements.jobType}
- Nível: ${jobRequirements.positionLevel}
- Requisitos: ${JSON.stringify(jobRequirements.requirements)}

Dê uma nota de 0-100 para este candidato e explique em 2-3 frases.
Responda APENAS em JSON:
{"score": 85, "reasoning": "Candidato tem boa experiência..."}
      `.trim();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0].message.content);
      return { score: result.score, reasoning: result.reasoning };
    } catch (error) {
      this.logger.error('OpenAI scoring failed, using fallback', error);
      return this.fallbackScore(candidateData, jobRequirements);
    }
  }

  async generateJobDescription(title: string, requirements: any): Promise<string> {
    if (!this.openai) {
      return `Estamos buscando um(a) ${title} para se juntar à nossa equipe. O candidato ideal terá boa comunicação e trabalho em equipe. Oferecemos ambiente dinâmico e oportunidades de crescimento.`;
    }

    try {
      const prompt = `
Crie uma descrição de vaga atraente para fast food para o cargo: ${title}
Requisitos: ${JSON.stringify(requirements)}
Seja direto, use tom amigável e informal. Máximo 150 palavras.
      `.trim();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error('OpenAI description generation failed', error);
      return `Estamos buscando um(a) ${title} para se juntar à nossa equipe!`;
    }
  }

  private fallbackScore(candidateData: any, jobRequirements: any): { score: number; reasoning: string } {
    let score = 50;
    const reasons: string[] = [];

    if (candidateData.experience && candidateData.experience.length > 10) {
      score += 15;
      reasons.push('candidato possui experiência relevante');
    }

    if (candidateData.distanceKm !== undefined) {
      const dist = Number(candidateData.distanceKm);
      if (dist <= 2) { score += 20; reasons.push('mora muito perto da loja'); }
      else if (dist <= 5) { score += 10; reasons.push('mora próximo da loja'); }
      else if (dist > 20) { score -= 10; reasons.push('mora distante da loja'); }
    }

    if (candidateData.availability) {
      score += 10;
      reasons.push('tem disponibilidade informada');
    }

    score = Math.max(0, Math.min(100, score));
    return {
      score,
      reasoning: reasons.length > 0
        ? `Score calculado automaticamente: ${reasons.join(', ')}.`
        : 'Score baseado em análise automática básica dos dados fornecidos.',
    };
  }
}

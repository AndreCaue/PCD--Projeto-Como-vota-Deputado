/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Resumo geral ──────────────────────────────────────────────────────────
  async getResumo() {
    const [
      totalVotacoes,
      totalDeputados,
      totalVotos,
      totalPartidos,
      totalOrientacoes,
    ] = await Promise.all([
      this.prisma.votacao.count(),
      this.prisma.deputado.count(),
      this.prisma.voto.count(),
      this.prisma.partido.count(),
      this.prisma.orientacaoBancada.count(),
    ]);

    // Votações com votos (nominais reais)
    const votacoesComVotos = await this.prisma.votacao.count({
      where: { votos: { some: {} } },
    });

    return {
      totalVotacoes,
      votacoesComVotos,
      totalDeputados,
      totalVotos,
      totalPartidos,
      totalOrientacoes,
    };
  }

  // ─── Distribuição geral de votos ───────────────────────────────────────────
  async getDistribuicaoVotos() {
    const grupos = await this.prisma.voto.groupBy({
      by: ['voto'],
      _count: { voto: true },
      orderBy: { _count: { voto: 'desc' } },
    });

    const total = grupos.reduce((acc, g) => acc + g._count.voto, 0);

    const CORES: Record<string, string> = {
      SIM: '#22c55e',
      NAO: '#ef4444',
      ABSTENCAO: '#3b82f6',
      OBSTRUCAO: '#f59e0b',
    };

    const LABELS: Record<string, string> = {
      SIM: 'Sim',
      NAO: 'Não',
      ABSTENCAO: 'Abstenção',
      OBSTRUCAO: 'Obstrução',
    };

    return {
      total,
      distribuicao: grupos.map((g) => ({
        tipo: g.voto,
        label: LABELS[g.voto] ?? g.voto,
        quantidade: g._count.voto,
        percentual: total > 0 ? +((g._count.voto / total) * 100).toFixed(1) : 0,
        cor: CORES[g.voto] ?? '#6b7280',
      })),
    };
  }

  // ─── Disciplina partidária ─────────────────────────────────────────────────
  async getDisciplinaPartidos(limit = 20) {
    // Busca todos os votos que têm orientação definida (não null)
    const votos = await this.prisma.voto.findMany({
      where: { seguiuOrientacao: { not: null } },
      include: {
        deputado: { include: { partido: true } },
      },
    });

    // Agrupa por partido
    const porPartido = new Map<
      string,
      { sigla: string; nome: string; seguiu: number; divergiu: number }
    >();

    votos.forEach((v) => {
      const sigla = v.deputado.partido?.sigla ?? 'N/A';
      const nome = v.deputado.partido?.nome ?? 'N/A';

      if (!porPartido.has(sigla)) {
        porPartido.set(sigla, { sigla, nome, seguiu: 0, divergiu: 0 });
      }

      const entry = porPartido.get(sigla)!;
      if (v.seguiuOrientacao === true) entry.seguiu++;
      else if (v.seguiuOrientacao === false) entry.divergiu++;
    });

    // Calcula % e ordena por disciplina
    const resultado = Array.from(porPartido.values())
      .map((p) => {
        const total = p.seguiu + p.divergiu;
        const disciplina =
          total > 0 ? +((p.seguiu / total) * 100).toFixed(1) : 0;
        return { ...p, total, disciplina };
      })
      .filter((p) => p.total >= 5) // só partidos com dados suficientes
      .sort((a, b) => b.disciplina - a.disciplina)
      .slice(0, limit);

    return { data: resultado };
  }

  // ─── Deputados mais rebeldes ───────────────────────────────────────────────
  async getDeputadosRebeldes(limit = 10) {
    const votos = await this.prisma.voto.findMany({
      where: { seguiuOrientacao: { not: null } },
      include: {
        deputado: { include: { partido: true } },
      },
    });

    // Agrupa por deputado
    const porDeputado = new Map<
      string,
      {
        id: string;
        nome: string;
        urlFoto?: string;
        partido: string;
        estado: string;
        seguiu: number;
        divergiu: number;
      }
    >();

    votos.forEach((v) => {
      const dep = v.deputado;
      if (!porDeputado.has(dep.id)) {
        porDeputado.set(dep.id, {
          id: dep.id,
          nome: dep.nome,
          urlFoto: dep.urlFoto ?? undefined,
          partido: dep.partido?.sigla ?? 'N/A',
          estado: dep.estado,
          seguiu: 0,
          divergiu: 0,
        });
      }

      const entry = porDeputado.get(dep.id)!;
      if (v.seguiuOrientacao === true) entry.seguiu++;
      else if (v.seguiuOrientacao === false) entry.divergiu++;
    });

    const calcular = (
      entries: typeof porDeputado,
      ordem: 'rebeldes' | 'alinhados',
    ) => {
      return Array.from(entries.values())
        .map((d) => {
          const total = d.seguiu + d.divergiu;
          const disciplina =
            total > 0 ? +((d.seguiu / total) * 100).toFixed(1) : 0;
          return { ...d, total, disciplina };
        })
        .filter((d) => d.total >= 3) // mínimo de votações com orientação
        .sort(
          (a, b) =>
            ordem === 'rebeldes'
              ? a.disciplina - b.disciplina // menos disciplinados primeiro
              : b.disciplina - a.disciplina, // mais disciplinados primeiro
        )
        .slice(0, limit);
    };

    return {
      rebeldes: calcular(porDeputado, 'rebeldes'),
      alinhados: calcular(porDeputado, 'alinhados'),
    };
  }

  // ─── Votações mais recentes com resumo ────────────────────────────────────
  async getVotacoesDestaque(limit = 5) {
    const votacoes = await this.prisma.votacao.findMany({
      where: { votos: { some: {} } },
      orderBy: { data: 'desc' },
      take: limit,
      include: {
        _count: { select: { votos: true } },
        votos: {
          select: { voto: true },
        },
      },
    });

    return {
      data: votacoes.map((v) => {
        const contagem: Record<string, number> = {};
        v.votos.forEach((voto) => {
          contagem[voto.voto] = (contagem[voto.voto] ?? 0) + 1;
        });

        return {
          id: v.id,
          descricao: v.descricao,
          data: v.data,
          siglaTipo: v.siglaTipo,
          totalVotos: v._count.votos,
          contagem,
        };
      }),
    };
  }
}

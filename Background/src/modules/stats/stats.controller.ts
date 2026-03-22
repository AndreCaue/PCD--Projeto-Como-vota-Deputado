import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('resumo')
  @ApiOperation({ summary: 'Totais gerais do sistema' })
  getResumo() {
    return this.statsService.getResumo();
  }

  @Get('distribuicao-votos')
  @ApiOperation({
    summary: 'Distribuição geral de votos (SIM/NÃO/ABSTENÇÃO/OBSTRUÇÃO)',
  })
  getDistribuicaoVotos() {
    return this.statsService.getDistribuicaoVotos();
  }

  @Get('disciplina-partidos')
  @ApiOperation({ summary: 'Ranking de disciplina partidária' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade de partidos (default: 20)',
  })
  getDisciplinaPartidos(@Query('limit') limit = '20') {
    return this.statsService.getDisciplinaPartidos(+limit);
  }

  @Get('deputados-destaque')
  @ApiOperation({ summary: 'Deputados mais rebeldes e mais alinhados' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade por lista (default: 10)',
  })
  getDeputadosRebeldes(@Query('limit') limit = '10') {
    return this.statsService.getDeputadosRebeldes(+limit);
  }

  @Get('votacoes-destaque')
  @ApiOperation({ summary: 'Votações recentes com resumo de votos' })
  @ApiQuery({ name: 'limit', required: false })
  getVotacoesDestaque(@Query('limit') limit = '5') {
    return this.statsService.getVotacoesDestaque(+limit);
  }
}

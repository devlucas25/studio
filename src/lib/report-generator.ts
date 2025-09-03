import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Interview, Survey, ReportFilters } from '@/types/database';

export interface ReportData {
  title: string;
  description?: string;
  generatedAt: string;
  filters?: ReportFilters;
  data: any;
}

export interface VoteIntentionReport extends ReportData {
  candidates: Array<{
    name: string;
    percentage: number;
    votes: number;
  }>;
  totalResponses: number;
  marginOfError: number;
}

export interface ManagementApprovalReport extends ReportData {
  approval: {
    approve: number;
    disapprove: number;
    neutral: number;
  };
  demographics: {
    byAge: Record<string, any>;
    byGender: Record<string, any>;
    byLocation: Record<string, any>;
  };
}

export class ReportGenerator {
  private static addHeader(doc: jsPDF, title: string) {
    // London Pesquisas header
    doc.setFillColor(30, 64, 175); // Primary blue
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LONDON PESQUISAS', 20, 15);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema Profissional de Pesquisas Eleitorais', 20, 20);
    
    // Report title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 40);
    
    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 50);
    
    return 60; // Return Y position for content
  }

  private static addFooter(doc: jsPDF, pageNumber: number) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Página ${pageNumber}`, 20, pageHeight - 10);
    doc.text('London Pesquisas - Confidencial', 150, pageHeight - 10);
  }

  static generateVoteIntentionPDF(report: VoteIntentionReport): Blob {
    const doc = new jsPDF();
    let yPos = this.addHeader(doc, 'RELATÓRIO DE INTENÇÃO DE VOTO');

    // Executive Summary
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO EXECUTIVO', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de entrevistas: ${report.totalResponses}`, 20, yPos);
    yPos += 6;
    doc.text(`Margem de erro: ±${report.marginOfError}%`, 20, yPos);
    yPos += 6;
    doc.text(`Nível de confiança: 95%`, 20, yPos);

    // Results table
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESULTADOS POR CANDIDATO', 20, yPos);

    yPos += 15;
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 5, 170, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Candidato', 25, yPos);
    doc.text('Votos', 100, yPos);
    doc.text('Percentual', 140, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    
    report.candidates.forEach((candidate, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPos - 5, 170, 8, 'F');
      }
      
      doc.text(candidate.name, 25, yPos);
      doc.text(candidate.votes.toString(), 100, yPos);
      doc.text(`${candidate.percentage.toFixed(1)}%`, 140, yPos);
      yPos += 8;
    });

    // Methodology
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('METODOLOGIA', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const methodology = [
      'Esta pesquisa foi realizada através de entrevistas presenciais com validação GPS.',
      'A amostra foi estratificada por bairros e perfil demográfico.',
      'Todas as entrevistas foram georreferenciadas e validadas em campo.',
      'Os dados foram coletados usando o sistema London Pesquisas com criptografia.'
    ];

    methodology.forEach(line => {
      doc.text(line, 20, yPos, { maxWidth: 170 });
      yPos += 6;
    });

    this.addFooter(doc, 1);
    return doc.output('blob');
  }

  static generateManagementApprovalPDF(report: ManagementApprovalReport): Blob {
    const doc = new jsPDF();
    let yPos = this.addHeader(doc, 'RELATÓRIO DE AVALIAÇÃO DE GESTÃO');

    // Executive Summary
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO EXECUTIVO', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const total = report.approval.approve + report.approval.disapprove + report.approval.neutral;
    const approvePercent = ((report.approval.approve / total) * 100).toFixed(1);
    const disapprovePercent = ((report.approval.disapprove / total) * 100).toFixed(1);
    const neutralPercent = ((report.approval.neutral / total) * 100).toFixed(1);

    doc.text(`Aprovação: ${approvePercent}% (${report.approval.approve} entrevistas)`, 20, yPos);
    yPos += 6;
    doc.text(`Rejeição: ${disapprovePercent}% (${report.approval.disapprove} entrevistas)`, 20, yPos);
    yPos += 6;
    doc.text(`Neutros: ${neutralPercent}% (${report.approval.neutral} entrevistas)`, 20, yPos);

    // Analysis by demographics
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISE DEMOGRÁFICA', 20, yPos);

    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Por Faixa Etária:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(report.demographics.byAge).forEach(([age, data]: [string, any]) => {
      doc.text(`${age}: ${data.approval}% aprovação`, 25, yPos);
      yPos += 6;
    });

    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Por Gênero:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(report.demographics.byGender).forEach(([gender, data]: [string, any]) => {
      doc.text(`${gender}: ${data.approval}% aprovação`, 25, yPos);
      yPos += 6;
    });

    this.addFooter(doc, 1);
    return doc.output('blob');
  }

  static generateExcelReport(data: any[], filename: string): Blob {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    
    // Style the header
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E40AF" } },
        alignment: { horizontal: "center" }
      };
    }

    // Auto-size columns
    const colWidths = data.reduce((acc, row) => {
      Object.keys(row).forEach((key, index) => {
        const value = row[key]?.toString() || '';
        acc[index] = Math.max(acc[index] || 10, value.length + 2, key.length + 2);
      });
      return acc;
    }, {} as Record<number, number>);

    ws['!cols'] = Object.values(colWidths).map(width => ({ width }));

    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    
    // Add metadata sheet
    const metaData = [
      { Campo: 'Gerado em', Valor: new Date().toLocaleString('pt-BR') },
      { Campo: 'Sistema', Valor: 'London Pesquisas' },
      { Campo: 'Total de registros', Valor: data.length },
      { Campo: 'Versão', Valor: '2.0' }
    ];
    
    const metaWs = XLSX.utils.json_to_sheet(metaData);
    XLSX.utils.book_append_sheet(wb, metaWs, 'Metadados');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  static generateProgressReport(interviews: Interview[], surveys: Survey[]): ReportData {
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;
    const progressPercentage = totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0;

    const surveyProgress = surveys.map(survey => {
      const surveyInterviews = interviews.filter(i => i.survey_id === survey.id);
      const completed = surveyInterviews.filter(i => i.status === 'completed').length;
      
      return {
        surveyTitle: survey.title,
        total: surveyInterviews.length,
        completed,
        percentage: surveyInterviews.length > 0 ? (completed / surveyInterviews.length) * 100 : 0
      };
    });

    return {
      title: 'Relatório de Progresso',
      description: 'Acompanhamento do progresso das pesquisas em campo',
      generatedAt: new Date().toISOString(),
      data: {
        totalInterviews,
        completedInterviews,
        progressPercentage,
        surveyProgress,
        lastUpdate: new Date().toLocaleString('pt-BR')
      }
    };
  }

  static downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
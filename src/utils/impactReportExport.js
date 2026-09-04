/**
 * Utility for generating and downloading Collective and Individual
 * Member Monthly Impact Stories Reports in CSV and Printable PDF formats.
 */

export const MONTH_NAMES = [
  { key: '01', name: 'January', short: 'Jan' },
  { key: '02', name: 'February', short: 'Feb' },
  { key: '03', name: 'March', short: 'Mar' },
  { key: '04', name: 'April', short: 'Apr' },
  { key: '05', name: 'May', short: 'May' },
  { key: '06', name: 'June', short: 'Jun' },
  { key: '07', name: 'July', short: 'Jul' },
  { key: '08', name: 'August', short: 'Aug' },
  { key: '09', name: 'September', short: 'Sep' },
  { key: '10', name: 'October', short: 'Oct' },
  { key: '11', name: 'November', short: 'Nov' },
  { key: '12', name: 'December', short: 'Dec' }
];

const TIER_LABELS = {
  tier_1: 'Tier 1: Personal Advocate',
  tier_2: 'Tier 2: Movement Champion',
  tier_3: 'Tier 3: Strategic Leader'
};

/**
 * Escapes fields for CSV string safety.
 */
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers a browser file download of CSV content with UTF-8 BOM.
 */
function triggerCsvDownload(content, filename) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. COLLECTIVE REPORT - CSV EXPORT
 * Exports a spreadsheet of members and their 12-month submission records.
 */
export function exportCollectiveImpactReportCSV({ leads = [], year = new Date().getFullYear(), scopeLabel = 'All Members' }) {
  const headers = [
    'S/N',
    'Membership ID',
    'Full Name',
    'Email Address',
    'Phone Number',
    'Current Tier',
    'Sub-Committee',
    'Registered Date',
    ...MONTH_NAMES.map((m) => `${m.short} ${year}`),
    `Total Submissions (${year})`,
    'Compliance Rate (%)'
  ];

  const rows = leads.map((lead, idx) => {
    const submissions = lead.impact_submissions || {};
    let submittedCount = 0;

    const monthStatuses = MONTH_NAMES.map((m) => {
      const key = `${year}-${m.key}`;
      const isSubmitted = submissions[key] === true;
      if (isSubmitted) submittedCount++;
      return isSubmitted ? 'Submitted' : 'Pending';
    });

    const complianceRate = Math.round((submittedCount / 12) * 100);
    const subCommitteeName = lead.sub_committees?.name || lead.sub_committee || 'Not Assigned';
    const tierName = TIER_LABELS[lead.tier] || lead.tier || 'Tier 1';
    const regDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB') : '—';

    return [
      idx + 1,
      lead.membership_id || 'Pending',
      lead.full_name || 'Member',
      lead.email || '',
      lead.phone || '',
      tierName,
      subCommitteeName,
      regDate,
      ...monthStatuses,
      `${submittedCount} / 12`,
      `${complianceRate}%`
    ].map(escapeCsv).join(',');
  });

  const metadata = [
    `"Doing Right Awareness Initiative (DRAI) - Collective Member Impact Stories Report"`,
    `"Reporting Year: ${year}"`,
    `"Scope: ${scopeLabel}"`,
    `"Total Members Included: ${leads.length}"`,
    `"Generated On: ${new Date().toLocaleString('en-GB')}"`,
    ''
  ].join('\n');

  const csvContent = metadata + '\n' + headers.map(escapeCsv).join(',') + '\n' + rows.join('\n');
  const filename = `DRAI_Collective_Impact_Report_${year}_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerCsvDownload(csvContent, filename);
}

/**
 * 2. INDIVIDUAL REPORT - CSV EXPORT
 * Exports a detailed single member audit report of monthly submissions across years/months.
 */
export function exportIndividualImpactReportCSV({ lead, year = new Date().getFullYear() }) {
  if (!lead) return;

  const submissions = lead.impact_submissions || {};
  let yearSubmittedCount = 0;

  const monthRows = MONTH_NAMES.map((m) => {
    const key = `${year}-${m.key}`;
    const isSubmitted = submissions[key] === true;
    if (isSubmitted) yearSubmittedCount++;
    return [
      m.name,
      year,
      key,
      isSubmitted ? 'SUBMITTED' : 'PENDING',
      isSubmitted ? 'Verified on WhatsApp Community' : 'Awaiting Submission'
    ].map(escapeCsv).join(',');
  });

  const complianceRate = Math.round((yearSubmittedCount / 12) * 100);
  const tierName = TIER_LABELS[lead.tier] || lead.tier || 'Tier 1';
  const subCommitteeName = lead.sub_committees?.name || lead.sub_committee || 'None Assigned';

  const memberInfo = [
    `"Doing Right Awareness Initiative (DRAI) - Member Impact Stories Report"`,
    `"Member Name",${escapeCsv(lead.full_name)}`,
    `"Membership ID",${escapeCsv(lead.membership_id || 'Pending')}`,
    `"Current Tier",${escapeCsv(tierName)}`,
    `"Email Address",${escapeCsv(lead.email)}`,
    `"Phone Number",${escapeCsv(lead.phone || 'N/A')}`,
    `"Assigned Sub-Committee",${escapeCsv(subCommitteeName)}`,
    `"Registration Date",${escapeCsv(lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB') : 'N/A')}`,
    `"Evaluation Year",${escapeCsv(year)}`,
    `"Total Stories Submitted in ${year}",${escapeCsv(`${yearSubmittedCount} out of 12 months`)}`,
    `"Annual Compliance Rate",${escapeCsv(`${complianceRate}%`)}`,
    `"Report Generated",${escapeCsv(new Date().toLocaleString('en-GB'))}`,
    '',
    `"Month","Year","Month Key","Submission Status","Notes"`
  ].join('\n');

  const csvContent = memberInfo + '\n' + monthRows.join('\n');
  const safeName = (lead.full_name || 'Member').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `DRAI_Impact_Report_${safeName}_${year}.csv`;
  triggerCsvDownload(csvContent, filename);
}

/**
 * 3. COLLECTIVE REPORT - PRINTABLE / PDF FORMAT
 * Generates an executive print-formatted document with branding, metrics, and tabular overview.
 */
export function printCollectiveImpactReport({ leads = [], year = new Date().getFullYear(), scopeLabel = 'All Members' }) {
  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Please allow pop-ups in your browser to print the impact report.');
    return;
  }

  const totalMembers = leads.length;
  let totalSubmittedEntries = 0;
  const totalPossible = totalMembers * 12;

  leads.forEach((l) => {
    const subs = l.impact_submissions || {};
    MONTH_NAMES.forEach((m) => {
      if (subs[`${year}-${m.key}`] === true) totalSubmittedEntries++;
    });
  });

  const overallRate = totalPossible > 0 ? Math.round((totalSubmittedEntries / totalPossible) * 100) : 0;

  const tableRows = leads
    .map((lead, idx) => {
      const submissions = lead.impact_submissions || {};
      let memberCount = 0;

      const monthCells = MONTH_NAMES.map((m) => {
        const key = `${year}-${m.key}`;
        const isSubmitted = submissions[key] === true;
        if (isSubmitted) memberCount++;
        return `<td class="text-center ${isSubmitted ? 'submitted-cell' : 'pending-cell'}">
          ${isSubmitted ? '✅' : '<span class="text-muted">✕</span>'}
        </td>`;
      }).join('');

      const tierBadgeClass =
        lead.tier === 'tier_3' ? 'tier-3' : lead.tier === 'tier_2' ? 'tier-2' : 'tier-1';

      return `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>
            <strong>${lead.full_name || 'Member'}</strong>
            <div class="sub-text">${lead.membership_id || 'ID Pending'}</div>
          </td>
          <td>
            <span class="badge ${tierBadgeClass}">${TIER_LABELS[lead.tier] || lead.tier}</span>
          </td>
          <td>${lead.sub_committees?.name || lead.sub_committee || '—'}</td>
          ${monthCells}
          <td class="text-center font-bold">${memberCount}/12</td>
          <td class="text-center font-bold">${Math.round((memberCount / 12) * 100)}%</td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>DRAI Member Impact Stories Report - ${year}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 24px;
          background: #fff;
          font-size: 12px;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #005BBB;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .logo-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .logo-img {
          height: 48px;
          width: auto;
        }
        .title-h1 {
          font-size: 20px;
          font-weight: 800;
          color: #005BBB;
          margin: 0;
        }
        .title-sub {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }
        .meta-box {
          text-align: right;
          font-size: 11px;
          color: #475569;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 6px 8px;
          font-size: 11px;
        }
        th {
          background: #f1f5f9;
          font-weight: 700;
          color: #1e293b;
          text-align: left;
        }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .sub-text { font-size: 9px; color: #64748b; font-family: monospace; }
        .submitted-cell { background-color: #f0fdf4; }
        .pending-cell { background-color: #ffffff; }
        .text-muted { color: #94a3b8; }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
        }
        .tier-1 { background: #dbeafe; color: #1e40af; }
        .tier-2 { background: #f3e8ff; color: #6b21a8; }
        .tier-3 { background: #fef3c7; color: #92400e; }
        .footer {
          margin-top: 30px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          font-size: 10px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; }
          .submitted-cell { background-color: #f0fdf4 !important; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div class="logo-title">
          <img src="/doing_right_logo.png" alt="DoRight Logo" class="logo-img" onerror="this.style.display='none'" />
          <div>
            <h1 class="title-h1">DOING RIGHT AWARENESS INITIATIVE (DRAI)</h1>
            <div class="title-sub">Official Member Monthly Impact Stories Audit Report &bull; Year ${year}</div>
          </div>
        </div>
        <div class="meta-box">
          <div><strong>Report Scope:</strong> ${scopeLabel}</div>
          <div><strong>Generated:</strong> ${new Date().toLocaleString('en-GB')}</div>
          <div><strong>System:</strong> DoRight Admin Platform</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Members</div>
          <div class="stat-value">${totalMembers}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Stories Submitted</div>
          <div class="stat-value" style="color: #16a34a;">${totalSubmittedEntries}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Annual Compliance Rate</div>
          <div class="stat-value" style="color: #005BBB;">${overallRate}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Evaluated Year</div>
          <div class="stat-value">${year}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;" class="text-center">#</th>
            <th>Member / Advocate</th>
            <th>Current Tier</th>
            <th>Sub-Committee</th>
            ${MONTH_NAMES.map((m) => `<th class="text-center" style="width: 36px;">${m.short}</th>`).join('')}
            <th class="text-center" style="width: 55px;">Total</th>
            <th class="text-center" style="width: 48px;">Rate</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <span>Official Executive Document &bull; Doing Right Awareness Initiative (admin@doright.ng)</span>
        <span>Page 1 of 1</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * 4. INDIVIDUAL REPORT - PRINTABLE / PDF FORMAT
 * Generates an official single-member verification certificate/report with monthly checklist.
 */
export function printIndividualImpactReport({ lead, year = new Date().getFullYear() }) {
  if (!lead) return;

  const printWindow = window.open('', '_blank', 'width=900,height=850');
  if (!printWindow) {
    alert('Please allow pop-ups in your browser to print the member report.');
    return;
  }

  const submissions = lead.impact_submissions || {};
  let submittedMonthsCount = 0;

  const monthCardsHtml = MONTH_NAMES.map((m) => {
    const key = `${year}-${m.key}`;
    const isSubmitted = submissions[key] === true;
    if (isSubmitted) submittedMonthsCount++;

    return `
      <div class="month-card ${isSubmitted ? 'month-submitted' : 'month-pending'}">
        <div class="month-name">${m.name} ${year}</div>
        <div class="month-status">${isSubmitted ? '✅ SUBMITTED' : '❌ PENDING'}</div>
        <div class="month-detail">${isSubmitted ? 'Verified on WhatsApp Community' : 'No recorded submission'}</div>
      </div>
    `;
  }).join('');

  const complianceRate = Math.round((submittedMonthsCount / 12) * 100);
  const tierName = TIER_LABELS[lead.tier] || lead.tier || 'Tier 1';
  const subCommitteeName = lead.sub_committees?.name || lead.sub_committee || 'Not Assigned';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Member Impact Report - ${lead.full_name || 'Member'}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 32px;
          background: #fff;
          font-size: 13px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #005BBB;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo-h1 {
          font-size: 20px;
          font-weight: 800;
          color: #005BBB;
          margin: 0;
        }
        .sub-header {
          color: #64748b;
          font-size: 12px;
          margin-top: 4px;
        }
        .member-profile-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 20px;
        }
        .profile-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
        }
        .profile-val {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin-top: 2px;
        }
        .rate-box {
          background: #ffffff;
          border: 2px solid #F59E0B;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .rate-num {
          font-size: 32px;
          font-weight: 900;
          color: #005BBB;
        }
        .rate-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #b45309;
          margin-top: 4px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .months-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 30px;
        }
        .month-card {
          border-radius: 8px;
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
        }
        .month-submitted {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }
        .month-pending {
          background: #fafafa;
          border-color: #e5e5e5;
        }
        .month-name {
          font-weight: 700;
          font-size: 13px;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .month-status {
          font-size: 11px;
          font-weight: 800;
        }
        .month-submitted .month-status { color: #15803d; }
        .month-pending .month-status { color: #94a3b8; }
        .month-detail {
          font-size: 10px;
          color: #64748b;
          margin-top: 4px;
        }
        .sign-off-box {
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 40px;
        }
        .sign-line {
          border-bottom: 1px solid #94a3b8;
          height: 36px;
          margin-bottom: 6px;
        }
        .sign-text {
          font-size: 11px;
          color: #64748b;
        }
        @media print {
          body { padding: 0; }
          .month-submitted { background-color: #f0fdf4 !important; -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="logo-h1">DOING RIGHT AWARENESS INITIATIVE (DRAI)</h1>
          <div class="sub-header">Individual Member Impact Verification Report &bull; Year ${year}</div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b;">
          <div>Generated: ${new Date().toLocaleDateString('en-GB')}</div>
          <div>Official Record Copy</div>
        </div>
      </div>

      <div class="member-profile-card">
        <div class="profile-grid">
          <div>
            <div class="profile-label">Member Full Name</div>
            <div class="profile-val">${lead.full_name || 'Member'}</div>
          </div>
          <div>
            <div class="profile-label">Membership ID</div>
            <div class="profile-val" style="color: #b45309; font-family: monospace;">${lead.membership_id || 'Pending'}</div>
          </div>
          <div>
            <div class="profile-label">Current Membership Tier</div>
            <div class="profile-val">${tierName}</div>
          </div>
          <div>
            <div class="profile-label">Sub-Committee</div>
            <div class="profile-val">${subCommitteeName}</div>
          </div>
          <div>
            <div class="profile-label">Email Address</div>
            <div class="profile-val">${lead.email || 'N/A'}</div>
          </div>
          <div>
            <div class="profile-label">Phone Number</div>
            <div class="profile-val">${lead.phone || 'N/A'}</div>
          </div>
        </div>

        <div class="rate-box">
          <div class="rate-num">${complianceRate}%</div>
          <div class="rate-label">Impact Compliance (${submittedMonthsCount}/12)</div>
        </div>
      </div>

      <div class="section-title">
        <span>Monthly Impact Story Submissions Breakdown</span>
        <span style="font-size: 12px; font-weight: 600; color: #64748b;">Year ${year}</span>
      </div>

      <div class="months-grid">
        ${monthCardsHtml}
      </div>

      <div class="sign-off-box">
        <div>
          <div class="sign-line"></div>
          <div class="sign-text">Reviewed &amp; Verified By (Administrator Name)</div>
        </div>
        <div>
          <div class="sign-line"></div>
          <div class="sign-text">Date &amp; Official Seal</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

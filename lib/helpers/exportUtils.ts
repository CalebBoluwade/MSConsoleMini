// lib/helpers/exportUtils.ts
import { formatDateTime } from "./utils";

export interface ExportData {
  serviceMonitors: BaseMonitor[];
}

export const exportToExcel = (data: ExportData) => {
  const { serviceMonitors } = data;

  // Create CSV content
  const headers = [
    "Service Name",
    "Description",
    "IP Address",
    "Agent",
    "Health Status",
    "Device Type",
    "Is Monitored",
    "Created At",
    "Last Check Time",
    "Uptime",
  ];

  const csvContent = [
    headers.join(","),
    ...serviceMonitors.map((monitor) =>
      [
        `"${monitor.ServiceName}"`,
        `"${monitor.Description}"`,
        monitor.IPAddress,
        `"${monitor.Agent}"`,
        `"${monitor.CurrentHealthCheck}"`,
        `"${monitor.Device}"`,
        monitor.IsMonitored ? "Yes" : "No",
        `"${formatDateTime(monitor.CreatedAt)}"`,
        `"${
          monitor.Metadata
            ? formatDateTime(monitor.Metadata.LastCheckTime!)
            : "N/A"
        }"`,
        `"${
          monitor.Metadata
            ? formatDateTime(monitor.Metadata.LastServiceUpTime!)
            : "N/A"
        }"`,
      ].join(",")
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `service-monitors-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: ExportData) => {
  const { serviceMonitors } = data;

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Service Monitors Inventory</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; color: #333; }
        .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .status-healthy { color: #10b981; }
        .status-degraded { color: #f59e0b; }
        .status-escalation { color: #ef4444; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Application Inventory Report</div>
        <div class="subtitle">Service Monitors - Generated on ${new Date().toLocaleDateString()}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Service Name</th>
            <th>IP Address</th>
            <th>Health Status</th>
            <th>Device Type</th>
            <th>Monitored</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${serviceMonitors
            .map(
              (monitor) => `
            <tr>
              <td>${monitor.ServiceName}</td>
              <td>${monitor.IPAddress}</td>
              <td class="status-${monitor.CurrentHealthCheck.toLowerCase()}">${
                monitor.CurrentHealthCheck
              }</td>
              <td>${monitor.Device}</td>
              <td>${monitor.IsMonitored ? "Yes" : "No"}</td>
              <td>${formatDateTime(monitor.CreatedAt)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="footer">
        Total Services: ${serviceMonitors.length} | 
        Active: ${serviceMonitors.filter((m) => m.IsMonitored).length} | 
        Healthy: ${
          serviceMonitors.filter((m) => m.CurrentHealthCheck === "Healthy")
            .length
        }
      </div>
    </body>
    </html>
  `;

  // Create and download PDF
  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.document.writeln(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    printWindow.addEventListener("load", () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        URL.revokeObjectURL(url);
      }, 250);
    });
  }
};

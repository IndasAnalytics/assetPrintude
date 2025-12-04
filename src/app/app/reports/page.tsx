"use client";

import { useState } from "react";
import { BarChart3, Download, FileText, TrendingUp, Package, Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-client";
import { format } from "date-fns";

type ReportType = "asset-inventory" | "asset-depreciation" | "repair-history" | "utilization" | "cost-analysis" | "warranty";

export default function ReportsPage() {
  const [period, setPeriod] = useState("this-month");
  const [isLoading, setIsLoading] = useState(false);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [loadingReport, setLoadingReport] = useState<ReportType | null>(null);

  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (period) {
      case "this-month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last-month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "this-quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "this-year":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        if (startDate && endDate) {
          return { start: startDate, end: endDate };
        }
        return null;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  };

  const handleGenerateReport = async (reportType: ReportType) => {
    if (period === "custom") {
      setSelectedReport(reportType);
      setIsDateDialogOpen(true);
      return;
    }

    await generateReport(reportType);
  };

  const generateReport = async (reportType: ReportType) => {
    try {
      setLoadingReport(reportType);
      setIsLoading(true);

      const dateRange = getDateRange();
      if (!dateRange) {
        toast.error("Please select valid date range");
        return;
      }

      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      const response = await authFetch(`/api/reports/${reportType}?${params}`);
      const data = await response.json();

      if (data.success) {
        downloadAsCSV(data.data, reportType);
        toast.success("Report generated successfully");
      } else {
        toast.error(data.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
      setLoadingReport(null);
      setIsDateDialogOpen(false);
    }
  };

  const downloadAsCSV = (data: any[], reportType: string) => {
    if (data.length === 0) {
      toast.info("No data available for the selected period");
      return;
    }

    // Get column headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          // Handle null/undefined and escape commas
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
        }).join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCustomDateSubmit = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    if (selectedReport) {
      generateReport(selectedReport);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download detailed reports
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-quarter">This Quarter</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Asset Inventory Report</CardTitle>
            </div>
            <CardDescription>
              Complete list of all assets with current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerateReport("asset-inventory")}
              disabled={isLoading}
            >
              {loadingReport === "asset-inventory" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Asset Depreciation</CardTitle>
            </div>
            <CardDescription>
              Track asset values and depreciation over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerateReport("asset-depreciation")}
              disabled={isLoading}
            >
              {loadingReport === "asset-depreciation" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <CardTitle>Repair History</CardTitle>
            </div>
            <CardDescription>
              All repairs with costs and completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerateReport("repair-history")}
              disabled={isLoading}
            >
              {loadingReport === "repair-history" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Utilization Report</CardTitle>
            </div>
            <CardDescription>
              Asset usage and assignment statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerateReport("utilization")}
              disabled={isLoading}
            >
              {loadingReport === "utilization" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Cost Analysis</CardTitle>
            </div>
            <CardDescription>
              Purchase costs, repairs, and total ownership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerateReport("cost-analysis")}
              disabled={isLoading}
            >
              {loadingReport === "cost-analysis" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Warranty Report</CardTitle>
            </div>
            <CardDescription>
              Assets under warranty and upcoming expirations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => handleGenerateReport("warranty")}
              disabled={isLoading}
            >
              {loadingReport === "warranty" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Formats */}
      <Card>
        <CardHeader>
          <CardTitle>Report Export Formats</CardTitle>
          <CardDescription>
            All reports are exported in CSV format for easy analysis in Excel, Google Sheets, or other tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Badge>CSV</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            CSV files can be opened with Microsoft Excel, Google Sheets, or any spreadsheet application.
          </p>
        </CardContent>
      </Card>

      {/* Custom Date Range Dialog */}
      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Custom Date Range</DialogTitle>
            <DialogDescription>
              Choose the start and end dates for your report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomDateSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

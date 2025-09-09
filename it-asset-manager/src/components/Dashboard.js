import React from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import { Box, Heading, VStack, HStack } from "@chakra-ui/react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Dashboard({ assets, stats }) {
  const assetTypeData = [
    { name: "PC", value: stats.totalPCs || 0 },
    { name: "Printer", value: stats.totalPrinters || 0 },
    { name: "CCTV", value: stats.totalCCTV || 0 },
    { name: "Other", value: stats.totalOther || 0 },
  ];

  const statusData = [
    { name: "Active", value: stats.active || 0 },
    { name: "Inactive", value: stats.inactive || 0 },
  ];

  const deptMap = {};
  assets.forEach((a) => {
    const dep = a.department || "Unknown";
    deptMap[dep] = (deptMap[dep] || 0) + 1;
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  return (
    <VStack spacing={6} align="stretch">
      <HStack spacing={6} wrap="wrap">
        <Box flex={1} bg="white" p={4} borderRadius="2xl" boxShadow="md">
          <Heading size="md">Asset Types</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={assetTypeData} dataKey="value" nameKey="name" outerRadius={80} label>
                {assetTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box flex={1} bg="white" p={4} borderRadius="2xl" boxShadow="md">
          <Heading size="md">Status</Heading>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </HStack>

      <Box bg="white" p={4} borderRadius="2xl" boxShadow="md">
        <Heading size="md" mb={2}>
          Assets by Department
        </Heading>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={deptData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  );
}

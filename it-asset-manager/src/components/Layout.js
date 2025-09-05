import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import { FiCpu, FiPrinter, FiCamera } from "react-icons/fi";

export default function Layout({ children }) {
  return (
    <HStack align="start" spacing={0} height="100vh">
      {/* Sidebar */}
      <VStack
        width="200px"
        bg="gray.800"
        color="white"
        spacing={8}
        p={5}
        align="stretch"
      >
        <Text fontSize="xl" fontWeight="bold">IT Asset Manager</Text>
        <Box><FiCpu /> PCs</Box>
        <Box><FiPrinter /> Printers</Box>
        <Box><FiCamera /> CCTV</Box>
      </VStack>

      {/* Main Content */}
      <Box flex="1" bg="gray.100" p={5}>
        {children}
      </Box>
    </HStack>
  );
}

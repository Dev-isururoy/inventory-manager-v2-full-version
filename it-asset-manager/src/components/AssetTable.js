import { Table, Thead, Tbody, Tr, Th, Td, Box, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function AssetTable({ assets }) {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      p={5}
      boxShadow="md"
      borderRadius="md"
      bg="white"
    >
      <Heading size="md" mb={4}>IT Assets</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {assets.map(asset => (
            <Tr key={asset.id}>
              <Td>{asset.id}</Td>
              <Td>{asset.name}</Td>
              <Td>{asset.type}</Td>
              <Td>{asset.status}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </MotionBox>
  );
}

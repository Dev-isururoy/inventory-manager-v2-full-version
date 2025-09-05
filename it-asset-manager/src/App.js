import { Monitor, Printer, Video, Database } from "lucide-react";
import { Badge } from "@chakra-ui/react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChakraProvider,
  Box,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useDisclosure,
  HStack,
} from "@chakra-ui/react";

function App() {
  // Asset Data
  const [assets, setAssets] = useState([
    { 
      id: 1, name: "Laptop", type: "PC", status: "Active",
      serial: "SN001", department: "IT", assignedTo: "John Doe", location: "Head Office",
      assetCode:"KL/IT/COM/001"
    },
    { 
      id: 2, name: "Printer", type: "Printer", status: "Inactive",
      serial: "SN002", department: "Admin", assignedTo: "Jane Smith", location: "Branch Office",
      assetCode:"KL/IT/PRT/001"
    },
    { 
      id: 3, name: "CCTV Camera", type: "CCTV", status: "Active",
      serial: "SN003", department: "Security", assignedTo: "Mike Johnson", location: "Head Office",
      assetCode:"KL/IT/CAM/001"
    },
    { 
      id: 4, name: "Desktop", type: "PC", status: "Inactive",
      serial: "SN004", department: "Finance", assignedTo: "Sara Lee", location: "Branch Office",
      assetCode:"KL/IT/COM/002"
    },
  ]);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modal State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [currentAsset, setCurrentAsset] = useState({
    id: null,
    name: "",
    type: "",
    status: "",
    serial: "",
    department: "",
    assignedTo: "",
    location: "",
    assetCode: "",
  });

  // Filtered Assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType ? asset.type === filterType : true;
    const matchesStatus = filterStatus ? asset.status === filterStatus : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Open Add Modal
  const openAddModal = () => {
    setModalMode("add");
    setCurrentAsset({
      id: null,
      name: "",
      type: "",
      status: "",
      serial: "",
      department: "",
      assignedTo: "",
      location: "",
      assetCode: "",
    });
    onOpen();
  };

  // Open Edit Modal
  const openEditModal = (asset) => {
    setModalMode("edit");
    setCurrentAsset(asset);
    onOpen();
  };

  // Add or Edit Asset
  const handleSave = () => {
    if (modalMode === "add") {
      const id = assets.length ? assets[assets.length - 1].id + 1 : 1;
      setAssets([...assets, { id, ...currentAsset }]);
    } else if (modalMode === "edit") {
      setAssets(
        assets.map((asset) =>
          asset.id === currentAsset.id ? currentAsset : asset
        )
      );
    }
    onClose();
  };

  // Delete Asset
  const handleDelete = (id) => {
    setAssets(assets.filter((asset) => asset.id !== id));
  };

  return (
    <ChakraProvider>
      <Box p={5}>
        <Heading mb={5}>IT Asset Manager</Heading>

        {/* Dashboard Cards */}
        <Box mb={5} display="flex" gap={4} flexWrap="wrap">
          {[
            { label: "Total Assets", value: assets.length, bg: "blue.100" },
            { label: "Total PCs", value: assets.filter(a => a.type === "PC").length, bg: "green.100" },
            { label: "Total Printers", value: assets.filter(a => a.type === "Printer").length, bg: "orange.100" },
            { label: "Active", value: assets.filter(a => a.status === "Active").length, bg: "purple.100" },
            { label: "Inactive", value: assets.filter(a => a.status === "Inactive").length, bg: "red.100" },
          ].map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box bg={card.bg} p={4} borderRadius="md" minW="120px" textAlign="center">
                <Heading size="md">{card.value}</Heading>
                <Box>{card.label}</Box>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* Controls */}
        <HStack mb={5} spacing={4} flexWrap="wrap">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            minW="200px"
          />
          <Select
            placeholder="Filter by type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="PC">PC</option>
            <option value="Printer">Printer</option>
            <option value="CCTV">CCTV</option>
          </Select>
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
          <Button colorScheme="blue" size="sm" onClick={openAddModal}>
            Add Asset
          </Button>
        </HStack>

        {/* Table */}
        <VStack align="stretch">
  <Box overflowX="auto" maxH="400px" overflowY="auto">
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th>ID</Th>
          <Th>Name</Th>
          <Th>Type</Th>
          <Th>Status</Th>
          <Th>Asset Code</Th>
          <Th>Serial</Th>
          <Th>Department</Th>
          <Th>Assigned To</Th>
          <Th>Location</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {filteredAssets.map((asset) => (
          <motion.tr
            key={asset.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Td>{asset.id}</Td>
            <Td>{asset.name}</Td>
            <Td>
              {asset.type === "PC" && <Monitor size={18} style={{ display: "inline", marginRight: 5 }} />}
              {asset.type === "Printer" && <Printer size={18} style={{ display: "inline", marginRight: 5 }} />}
              {asset.type === "CCTV" && <Video size={18} style={{ display: "inline", marginRight: 5 }} />}
              {asset.type === "Other" && <Database size={18} style={{ display: "inline", marginRight: 5 }} />}
              {asset.type}
            </Td>
            <Td>
              <Badge colorScheme={asset.status === "Active" ? "green" : "red"}>
                {asset.status}
              </Badge>
            </Td>
            <Td>{asset.assetCode}</Td>
            <Td>{asset.serial}</Td>
            <Td>{asset.department}</Td>
            <Td>{asset.assignedTo}</Td>
            <Td>{asset.location}</Td>
            <Td>
              <HStack spacing={2}>
                <Button size="sm" colorScheme="yellow" onClick={() => openEditModal(asset)}>Edit</Button>
                <Button size="sm" colorScheme="red" onClick={() => handleDelete(asset.id)}>Delete</Button>
              </HStack>
            </Td>
          </motion.tr>
        ))}
      </Tbody>
    </Table>
  </Box>
</VStack>

        {/* Add/Edit Asset Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{modalMode === "add" ? "Add New Asset" : "Edit Asset"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Asset Name"
                    value={currentAsset.name}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, name: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    placeholder="Select Type"
                    value={currentAsset.type}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, type: e.target.value })}
                  >
                    <option value="PC">PC</option>
                    <option value="Printer">Printer</option>
                    <option value="CCTV">CCTV</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    placeholder="Select Status"
                    value={currentAsset.status}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Asset Code</FormLabel>
                  <Input
                    placeholder="Asset Code"
                    value={currentAsset.assetCode}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, assetCode: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Serial</FormLabel>
                  <Input
                    placeholder="Serial Number"
                    value={currentAsset.serial}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, serial: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    placeholder="Department"
                    value={currentAsset.department}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, department: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Assigned To</FormLabel>
                  <Input
                    placeholder="Person"
                    value={currentAsset.assignedTo}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, assignedTo: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    placeholder="Location"
                    value={currentAsset.location}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, location: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSave}>Save</Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
}

export default App;

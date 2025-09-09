// src/App.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChakraProvider,
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Badge,
  useToast,
  Spinner,
  Text,
} from "@chakra-ui/react";

// Fixed singular asset types
export const categories = [
  { value: "PC", label: "PC" },
  { value: "Printer", label: "Printer" },
  { value: "CCTV", label: "CCTV" },
  { value: "Access Control", label: "Access Control" },
  { value: "Access Point", label: "Access Point" },
  { value: "IP Phone", label: "IP Phone" },
  { value: "Analog Phone", label: "Analog Phone" },
  { value: "Portable Hard Disk", label: "Portable Hard Disk" },
  { value: "Pen Drive", label: "Pen Drive" },
  { value: "NVR", label: "NVR" },
  { value: "Server", label: "Server" },
  { value: "Network Switch", label: "Network Switch" },
  { value: "Other", label: "Other" },
];

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export default function App() {
  // data
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalPCs: 0,
    totalPrinters: 0,
    totalCCTV: 0,
    totalOther: 0,
    active: 0,
    inactive: 0,
  });

  // loading & status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // pagination & filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMode, setModalMode] = useState("add");
  const [currentAsset, setCurrentAsset] = useState({});

  const toast = useToast();
  const searchTimeoutRef = useRef(null);

  // fetch stats
  const fetchStats = async () => {
    try {
      const res = await API.get("/assets/stats");
      setStats(res.data || {});
    } catch (err) {
      console.error("fetchStats error:", err);
    }
  };

  // fetch assets
  const fetchAssets = async (opts = {}) => {
    const qPage = opts.page ?? page;
    const qLimit = opts.limit ?? limit;
    const qSearch = opts.search ?? search;
    const qType = opts.type ?? filterType;
    const qStatus = opts.status ?? filterStatus;

    setLoading(true);
    try {
      const res = await API.get("/assets", {
        params: {
          page: qPage,
          limit: qLimit,
          search: qSearch || undefined,
          type: qType || undefined,
          status: qStatus || undefined,
        },
      });

      const body = res.data;
      setAssets(body.data || []);
      setTotal(body.total || 0);
      setPages(body.pages || 1);
      setPage(body.page || 1);
    } catch (err) {
      console.error("fetchAssets error:", err);
      toast({
        title: "Error",
        description: "Failed to load assets. Is backend running?",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchStats();
    fetchAssets({ page: 1 });
  }, []);

  // debounce search/filter
  useEffect(() => {
    setPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchAssets({ page: 1, limit, search, type: filterType, status: filterStatus });
    }, 450);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [search, filterType, filterStatus, limit]);

  // page change
  useEffect(() => {
    fetchAssets({ page, limit });
  }, [page]);

  // open add modal
  const openAddModal = (type = "") => {
    setModalMode("add");
    setCurrentAsset({
      name: "",
      type: type || "",
      status: "Active",
      assetCode: "",
      serial: "",
      department: "",
      assignedTo: "",
      location: "",
      ipAddress: "",
      network: "",
    });
    onOpen();
  };

  // open edit modal
  const openEditModal = (asset) => {
    setModalMode("edit");
    setCurrentAsset({
      ...asset,
      ipAddress: asset.ipAddress ?? "",
      network: asset.network ?? "",
    });
    onOpen();
  };

  // save asset
  const handleSave = async () => {
    if (!currentAsset.name || !currentAsset.type || !currentAsset.assetCode) {
      toast({ title: "Please fill name/type/asset code", status: "warning", duration: 2500 });
      return;
    }
    setSaving(true);
    try {
      if (modalMode === "add") {
        await API.post("/assets", currentAsset);
        toast({ title: "Created", status: "success", duration: 1800 });
      } else {
        await API.put(`/assets/${currentAsset._id}`, currentAsset);
        toast({ title: "Updated", status: "success", duration: 1400 });
      }
      await fetchStats();
      await fetchAssets({ page: 1, limit });
      onClose();
    } catch (err) {
      console.error("handleSave error:", err);
      toast({ title: "Error", description: "Could not save asset.", status: "error", duration: 2500 });
    } finally {
      setSaving(false);
    }
  };

  // delete asset
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    setDeletingId(id);
    try {
      await API.delete(`/assets/${id}`);
      toast({ title: "Deleted", status: "info", duration: 1500 });
      await fetchStats();
      if (assets.length === 1 && page > 1) {
        setPage(page - 1);
        await fetchAssets({ page: page - 1, limit });
      } else {
        await fetchAssets({ page, limit });
      }
    } catch (err) {
      console.error("handleDelete error:", err);
      toast({ title: "Error", description: "Could not delete.", status: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  // pagination controls
  const gotoFirst = () => setPage(1);
  const gotoPrev = () => setPage((p) => Math.max(1, p - 1));
  const gotoNext = () => setPage((p) => Math.min(pages, p + 1));
  const gotoLast = () => setPage(pages);

  return (
    <ChakraProvider>
      <Box p={6} maxW="1200px" mx="auto" bg="gray.50" borderRadius="2xl">
        <VStack align="stretch" spacing={6}>
          <Heading size="lg">IT DEPARTMENT ASSETS MANAGEMENT SYSTEM</Heading>

          {/* Quick Action Buttons */}
          <HStack spacing={3} wrap="wrap" pt={4}>
            {["PC", "Printer", "CCTV", "Access Control", "Access Point"].map((type) => (
              <Button key={type} colorScheme="blue" borderRadius="xl" onClick={() => openAddModal(type)}>
                Add {type}
              </Button>
            ))}
          </HStack>

          {/* Stats */}
          <HStack spacing={4} wrap="wrap">
            <Box bg="blue.50" p={4} borderRadius="2xl" boxShadow="md" minW="140px" textAlign="center">
              <Text fontSize="sm">Total</Text>
              <Heading size="md">{stats.total}</Heading>
              <Text fontSize="xs">Assets</Text>
            </Box>
            <Box bg="green.50" p={4} borderRadius="2xl" boxShadow="md" minW="140px" textAlign="center">
              <Text fontSize="sm">PCs</Text>
              <Heading size="md">{stats.totalPCs}</Heading>
            </Box>
            <Box bg="orange.50" p={4} borderRadius="2xl" boxShadow="md" minW="140px" textAlign="center">
              <Text fontSize="sm">Printers</Text>
              <Heading size="md">{stats.totalPrinters}</Heading>
            </Box>
            <Box bg="purple.50" p={4} borderRadius="2xl" boxShadow="md" minW="140px" textAlign="center">
              <Text fontSize="sm">Active</Text>
              <Heading size="md">{stats.active}</Heading>
            </Box>
            <Box bg="red.50" p={4} borderRadius="2xl" boxShadow="md" minW="140px" textAlign="center">
              <Text fontSize="sm">Inactive</Text>
              <Heading size="md">{stats.inactive}</Heading>
            </Box>
          </HStack>

          {/* Controls */}
          <HStack spacing={3} wrap="wrap">
            <Input
              borderRadius="xl"
              placeholder="Search name, code, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              minW="220px"
            />
            <Select borderRadius="xl" placeholder="Filter by type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
            <Select borderRadius="xl" placeholder="Filter by status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
            <HStack>
              <Button colorScheme="blue" size="sm" borderRadius="xl" onClick={() => openAddModal()}>
                Add Asset
              </Button>
              <Button size="sm" borderRadius="xl" onClick={() => fetchAssets({ page: 1, limit })}>
                Refresh
              </Button>
            </HStack>
            <Box ml="auto" display="flex" alignItems="center" gap={2}>
              <Text fontSize="sm">Rows</Text>
              <Select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} size="sm" width="80px" borderRadius="xl">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Select>
            </Box>
          </HStack>

          {/* Table */}
          <Box bg="white" borderRadius="2xl" boxShadow="md" p={4} overflowX="auto" maxH="520px">
            {loading ? (
              <Box textAlign="center" p={8}>
                <Spinner size="lg" />
              </Box>
            ) : (
              <Table variant="striped" colorScheme="gray" size="sm">
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Asset Code</Th>
                    <Th>Name</Th>
                    <Th>Type</Th>
                    <Th>Serial</Th>
                    <Th>Department</Th>
                    <Th>Assigned To</Th>
                    <Th>Location</Th>
                    <Th>IP Address</Th>
                    <Th>Network</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <AnimatePresence>
                    {assets.map((asset, i) => (
                      <motion.tr key={asset._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}>
                        <Td>{(page - 1) * limit + (i + 1)}</Td>
                        <Td>{asset.assetCode}</Td>
                        <Td>{asset.name}</Td>
                        <Td>{asset.type}</Td>
                        <Td>{asset.serial}</Td>
                        <Td>{asset.department}</Td>
                        <Td>{asset.assignedTo}</Td>
                        <Td>{asset.location}</Td>
                        <Td>{asset.ipAddress}</Td>
                        <Td>{asset.network}</Td>
                        <Td>
                          <Badge colorScheme={asset.status === "Active" ? "green" : "red"}>{asset.status}</Badge>
                        </Td>
                        <Td>
                          <HStack>
                            <Button size="xs" colorScheme="yellow" borderRadius="xl" onClick={() => openEditModal(asset)}>
                              Edit
                            </Button>
                            <Button size="xs" colorScheme="red" borderRadius="xl" isLoading={deletingId === asset._id} onClick={() => handleDelete(asset._id)}>
                              Delete
                            </Button>
                          </HStack>
                        </Td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </Tbody>
              </Table>
            )}
            {!loading && assets.length === 0 && (
              <Box p={6} textAlign="center">
                <Text>No assets to show.</Text>
              </Box>
            )}
          </Box>

          {/* Pagination */}
          <HStack spacing={3} justify="space-between">
            <HStack>
              <Button size="sm" borderRadius="xl" onClick={gotoFirst} isDisabled={page === 1}>
                First
              </Button>
              <Button size="sm" borderRadius="xl" onClick={gotoPrev} isDisabled={page === 1}>
                Prev
              </Button>
              <Text>
                Page {page} of {pages}
              </Text>
              <Button size="sm" borderRadius="xl" onClick={gotoNext} isDisabled={page === pages}>
                Next
              </Button>
              <Button size="sm" borderRadius="xl" onClick={gotoLast} isDisabled={page === pages}>
                Last
              </Button>
            </HStack>
            <Text fontSize="sm">Total: {total} items</Text>
          </HStack>
        </VStack>

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="2xl">
            <ModalHeader>{modalMode === "add" ? "Add New Asset" : "Edit Asset"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={3} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Asset Code</FormLabel>
                  <Input
                    borderRadius="xl"
                    value={currentAsset.assetCode || ""}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, assetCode: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    borderRadius="xl"
                    value={currentAsset.name || ""}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, name: e.target.value })}
                  />
                </FormControl>
                <HStack spacing={3} width="100%">
                  <FormControl isRequired>
                    <FormLabel>Type</FormLabel>
                    <Select
                      borderRadius="xl"
                      value={currentAsset.type || ""}
                      onChange={(e) => setCurrentAsset({ ...currentAsset, type: e.target.value })}
                    >
                      <option value="">Select type</option>
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      borderRadius="xl"
                      value={currentAsset.status || ""}
                      onChange={(e) => setCurrentAsset({ ...currentAsset, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Select>
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel>Serial</FormLabel>
                  <Input
                    borderRadius="xl"
                    value={currentAsset.serial || ""}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, serial: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    borderRadius="xl"
                    value={currentAsset.department || ""}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, department: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Assigned To</FormLabel>
                  <Input
                    borderRadius="xl"
                    value={currentAsset.assignedTo || ""}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, assignedTo: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    borderRadius="xl"
                    value={currentAsset.location || ""}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, location: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>IP Address</FormLabel>
                  <Input
                    borderRadius="xl"
                    value={currentAsset.ipAddress || ""}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, ipAddress: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Network</FormLabel>
                  <Input
                    borderRadius="xl"
                    value={currentAsset.network || ""}
                    onChange={(e) => setCurrentAsset({ ...currentAsset, network: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSave} isLoading={saving} borderRadius="xl">
                Save
              </Button>
              <Button borderRadius="xl" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
}

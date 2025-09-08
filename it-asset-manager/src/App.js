// src/App.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Printer, Video, Database } from "lucide-react";
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
  IconButton,
} from "@chakra-ui/react";

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
  const [loading, setLoading] = useState(false); // fetching assets
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

  // fetch assets (paginated)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when search/filter/page/limit changes, refetch; debounce search
  useEffect(() => {
    // reset to page 1 whenever filters/search/limit change
    setPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchAssets({ page: 1, limit, search, type: filterType, status: filterStatus });
    }, 450);
    return () => clearTimeout(searchTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterType, filterStatus, limit]);

  // when page changes (user clicks next/prev), fetch
  useEffect(() => {
    fetchAssets({ page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // open add modal
  const openAddModal = () => {
    setModalMode("add");
    setCurrentAsset({
      name: "",
      type: "",
      status: "Active",
      assetCode: "",
      serial: "",
      department: "",
      assignedTo: "",
      location: "",
    });
    onOpen();
  };

  // open edit modal
  const openEditModal = (asset) => {
    setModalMode("edit");
    setCurrentAsset({ ...asset });
    onOpen();
  };

  // save (create / update)
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
      // fetch current page again (if new item added, it will appear in first page due to sort createdAt desc)
      await fetchAssets({ page: 1, limit });
      onClose();
    } catch (err) {
      console.error("handleSave error:", err);
      toast({ title: "Error", description: "Could not save asset.", status: "error", duration: 2500 });
    } finally {
      setSaving(false);
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    setDeletingId(id);
    try {
      await API.delete(`/assets/${id}`);
      toast({ title: "Deleted", status: "info", duration: 1500 });
      await fetchStats();
      // if deleting last item on last page, go back one page
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
      <Box p={6} maxW="1200px" mx="auto">
        <VStack align="stretch" spacing={6}>
          <Heading size="lg">IT Asset Manager</Heading>

          {/* dashboard cards - use stats from server */}
          <HStack spacing={4} wrap="wrap">
            <Box bg="blue.50" p={3} borderRadius="md" minW="140px" textAlign="center">
              <Text fontSize="sm">Total</Text>
              <Heading size="md">{stats.total}</Heading>
              <Text fontSize="xs">Assets</Text>
            </Box>
            <Box bg="green.50" p={3} borderRadius="md" minW="140px" textAlign="center">
              <Text fontSize="sm">PCs</Text>
              <Heading size="md">{stats.totalPCs}</Heading>
            </Box>
            <Box bg="orange.50" p={3} borderRadius="md" minW="140px" textAlign="center">
              <Text fontSize="sm">Printers</Text>
              <Heading size="md">{stats.totalPrinters}</Heading>
            </Box>
            <Box bg="purple.50" p={3} borderRadius="md" minW="140px" textAlign="center">
              <Text fontSize="sm">Active</Text>
              <Heading size="md">{stats.active}</Heading>
            </Box>
            <Box bg="red.50" p={3} borderRadius="md" minW="140px" textAlign="center">
              <Text fontSize="sm">Inactive</Text>
              <Heading size="md">{stats.inactive}</Heading>
            </Box>
          </HStack>

          {/* controls */}
          <HStack spacing={3} wrap="wrap">
            <Input
              placeholder="Search name, code, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              minW="220px"
            />
            <Select placeholder="Filter by type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All</option>
              <option value="PC">PC</option>
              <option value="Printer">Printer</option>
              <option value="CCTV">CCTV</option>
              <option value="Other">Other</option>
            </Select>
            <Select placeholder="Filter by status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>

            <HStack>
              <Button colorScheme="blue" size="sm" onClick={openAddModal}>Add Asset</Button>
              <Button size="sm" onClick={() => { setPage(1); fetchAssets({ page: 1, limit }); }}>Refresh</Button>
            </HStack>

            <Box ml="auto" display="flex" alignItems="center" gap={2}>
              <Text fontSize="sm">Rows</Text>
              <Select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} size="sm" width="80px">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </Select>
            </Box>
          </HStack>

          {/* table */}
          <Box bg="white" borderRadius="md" boxShadow="sm" p={2} overflowX="auto" maxH="520px" overflowY="auto">
            {loading ? (
              <Box textAlign="center" p={8}><Spinner size="lg" /></Box>
            ) : (
              <Table variant="simple" size="sm">
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
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <AnimatePresence>
                    {assets.map((asset, i) => (
                      <motion.tr
                        key={asset._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.18 }}
                      >
                        <Td>{(page - 1) * limit + (i + 1)}</Td>
                        <Td>{asset.assetCode}</Td>
                        <Td>{asset.name}</Td>
                        <Td>
                          {asset.type === "PC" && <Monitor size={14} style={{ display: "inline-block", marginRight: 6 }} />}
                          {asset.type === "Printer" && <Printer size={14} style={{ display: "inline-block", marginRight: 6 }} />}
                          {asset.type === "CCTV" && <Video size={14} style={{ display: "inline-block", marginRight: 6 }} />}
                          {asset.type === "Other" && <Database size={14} style={{ display: "inline-block", marginRight: 6 }} />}
                          {asset.type}
                        </Td>
                        <Td>{asset.serial}</Td>
                        <Td>{asset.department}</Td>
                        <Td>{asset.assignedTo}</Td>
                        <Td>{asset.location}</Td>
                        <Td><Badge colorScheme={asset.status === "Active" ? "green" : "red"}>{asset.status}</Badge></Td>
                        <Td>
                          <HStack>
                            <Button size="xs" colorScheme="yellow" onClick={() => openEditModal(asset)}>Edit</Button>
                            <Button size="xs" colorScheme="red" isLoading={deletingId === asset._id} onClick={() => handleDelete(asset._id)}>Delete</Button>
                          </HStack>
                        </Td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </Tbody>
              </Table>
            )}
            {(!loading && assets.length === 0) && (
              <Box p={6} textAlign="center"><Text>No assets to show.</Text></Box>
            )}
          </Box>

          {/* pagination */}
          <HStack spacing={3} justify="space-between">
            <HStack>
              <Button size="sm" onClick={gotoFirst} isDisabled={page === 1}>First</Button>
              <Button size="sm" onClick={gotoPrev} isDisabled={page === 1}>Prev</Button>
              <Text>Page {page} of {pages}</Text>
              <Button size="sm" onClick={gotoNext} isDisabled={page === pages}>Next</Button>
              <Button size="sm" onClick={gotoLast} isDisabled={page === pages}>Last</Button>
            </HStack>
            <Text fontSize="sm">Total: {total} items</Text>
          </HStack>
        </VStack>

        {/* Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{modalMode === "add" ? "Add New Asset" : "Edit Asset"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={3} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Asset Code</FormLabel>
                  <Input value={currentAsset.assetCode || ""} onChange={(e) => setCurrentAsset({ ...currentAsset, assetCode: e.target.value })} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input value={currentAsset.name || ""} onChange={(e) => setCurrentAsset({ ...currentAsset, name: e.target.value })} />
                </FormControl>
                <HStack spacing={3} width="100%">
                  <FormControl isRequired>
                    <FormLabel>Type</FormLabel>
                    <Select value={currentAsset.type || ""} onChange={(e) => setCurrentAsset({ ...currentAsset, type: e.target.value })}>
                      <option value="">Select type</option>
                      <option value="PC">PC</option>
                      <option value="Printer">Printer</option>
                      <option value="CCTV">CCTV</option>
                      <option value="Other">Other</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select value={currentAsset.status || ""} onChange={(e) => setCurrentAsset({ ...currentAsset, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Select>
                  </FormControl>
                </HStack>
                <FormControl><FormLabel>Serial</FormLabel><Input value={currentAsset.serial || ""} onChange={(e) => setCurrentAsset({ ...currentAsset, serial: e.target.value })} /></FormControl>
                <FormControl><FormLabel>Department</FormLabel><Input value={currentAsset.department || ""} onChange={(e) => setCurrentAsset({ ...currentAsset, department: e.target.value })} /></FormControl>
                <FormControl><FormLabel>Assigned To</FormLabel><Input value={currentAsset.assignedTo || ""} onChange={(e) => setCurrentAsset({ ...currentAsset, assignedTo: e.target.value })} /></FormControl>
                <FormControl><FormLabel>Location</FormLabel><Input value={currentAsset.location || ""} onChange={(e) => setCurrentAsset({ ...currentAsset, location: e.target.value })} /></FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSave} isLoading={saving}>Save</Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
}

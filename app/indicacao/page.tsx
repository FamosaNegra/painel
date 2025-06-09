"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  Download,
  Eye,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  CalendarIcon,
  ArrowUpDown,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProtectedPage } from "@/components/ProtectedPage";

interface Indication {
  id: string;
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  birthDate: string;
  address: {
    cep: string;
    number: string;
  };
  property?: {
    [key: string]: any;
  } | null;
  bank: {
    bank: string;
    agency: string;
    account: string;
  };
  isClient: boolean;
  indication: {
    name: string;
    cpf: string;
    phone: string;
  };
  status: string;
  createdAt: string;
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  processing: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  new: "Novo",
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  processing: "Processando",
};

export default function IndicationsPage() {
  const [indications, setIndications] = useState<Indication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [sortField, setSortField] = useState<keyof Indication>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  useEffect(() => {
    const fetchIndications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/indicacao");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setIndications(data);
      } catch (error) {
        console.error("Error fetching indications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndications();
  }, []);

  const filteredAndSortedData = useMemo(() => {
    const filtered = indications.filter((indication) => {
      const matchesSearch =
        indication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        indication.cpf.includes(searchTerm) ||
        indication.phone.includes(searchTerm) ||
        indication.indication.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || indication.status === statusFilter;
      const matchesClient =
        clientFilter === "all" ||
        (clientFilter === "client" && indication.isClient) ||
        (clientFilter === "non-client" && !indication.isClient);

      const createdDate = new Date(indication.createdAt);
      const matchesDateFrom = !dateFrom || createdDate >= dateFrom;
      const matchesDateTo = !dateTo || createdDate <= dateTo;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesClient &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt" || sortField === "birthDate") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    indications,
    searchTerm,
    statusFilter,
    clientFilter,
    dateFrom,
    dateTo,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = indications.length;
    const clients = indications.filter((i) => i.isClient).length;
    const newIndications = indications.filter((i) => i.status === "new").length;
    const approved = indications.filter((i) => i.status === "approved").length;

    return { total, clients, newIndications, approved };
  }, [indications]);

  const handleSort = (field: keyof Indication) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Nome",
      "CPF",
      "Telefone",
      "Status",
      "Cliente",
      "Data Criação",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedData.map((indication) =>
        [
          indication.name,
          indication.cpf,
          indication.phone,
          statusLabels[indication.status as keyof typeof statusLabels],
          indication.isClient ? "Sim" : "Não",
          format(new Date(indication.createdAt), "dd/MM/yyyy", {
            locale: ptBR,
          }),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "indicacoes.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando indicações...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPage permissionKey="MARKETING">
      <div className="container mx-auto p-6 space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Indicações
                </CardTitle>
                <CardDescription>Gerencie todas as indicações</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clientes
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.clients}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Novos</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.newIndications}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Aprovados
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approved}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, CPF ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="new">Novo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="client">Clientes</SelectItem>
                      <SelectItem value="non-client">Não Clientes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom
                          ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR })
                          : "Data inicial"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo
                          ? format(dateTo, "dd/MM/yyyy", { locale: ptBR })
                          : "Data final"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    onClick={exportToCSV}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </Button>
                </div>
                {(searchTerm ||
                  statusFilter !== "all" ||
                  clientFilter !== "all" ||
                  dateFrom ||
                  dateTo) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {filteredAndSortedData.length} de {indications.length}{" "}
                      indicações
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setClientFilter("all");
                        setDateFrom(undefined);
                        setDateTo(undefined);
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Table */}
            <Card  className="mt-4">
              <CardHeader>
                <CardTitle>Lista de Indicações</CardTitle>
                <CardDescription>
                  {filteredAndSortedData.length} indicações encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("name")}
                            className="h-auto p-0 font-semibold"
                          >
                            Nome
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("status")}
                            className="h-auto p-0 font-semibold"
                          >
                            Status
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Indicado por</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("createdAt")}
                            className="h-auto p-0 font-semibold"
                          >
                            Data
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((indication) => (
                        <TableRow key={indication.id}>
                          <TableCell className="font-medium">
                            {indication.name}
                          </TableCell>
                          <TableCell>{indication.cpf}</TableCell>
                          <TableCell>{indication.phone}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                statusColors[
                                  indication.status as keyof typeof statusColors
                                ]
                              }
                            >
                              {
                                statusLabels[
                                  indication.status as keyof typeof statusLabels
                                ]
                              }
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                indication.isClient ? "default" : "secondary"
                              }
                            >
                              {indication.isClient ? "Cliente" : "Não Cliente"}
                            </Badge>
                          </TableCell>
                          <TableCell>{indication.indication.name}</TableCell>
                          <TableCell>
                            {format(
                              new Date(indication.createdAt),
                              "dd/MM/yyyy",
                              {
                                locale: ptBR,
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Detalhes da Indicação
                                  </DialogTitle>
                                  <DialogDescription>
                                    Informações completas de {indication.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">
                                        Dados Pessoais
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <strong>Nome:</strong>{" "}
                                          {indication.name}
                                        </p>
                                        <p>
                                          <strong>RG:</strong> {indication.rg}
                                        </p>
                                        <p>
                                          <strong>CPF:</strong> {indication.cpf}
                                        </p>
                                        <p>
                                          <strong>Telefone:</strong>{" "}
                                          {indication.phone}
                                        </p>
                                        <p>
                                          <strong>Nascimento:</strong>{" "}
                                          {format(
                                            new Date(indication.birthDate),
                                            "dd/MM/yyyy",
                                            { locale: ptBR }
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">
                                        Endereço
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <strong>CEP:</strong>{" "}
                                          {indication.address.cep}
                                        </p>
                                        <p>
                                          <strong>Número:</strong>{" "}
                                          {indication.address.number}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">
                                        Dados Bancários
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <strong>Banco:</strong>{" "}
                                          {indication.bank.bank}
                                        </p>
                                        <p>
                                          <strong>Agência:</strong>{" "}
                                          {indication.bank.agency}
                                        </p>
                                        <p>
                                          <strong>Conta:</strong>{" "}
                                          {indication.bank.account}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">
                                        Indicação
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <strong>Nome:</strong>{" "}
                                          {indication.indication.name}
                                        </p>
                                        <p>
                                          <strong>CPF:</strong>{" "}
                                          {indication.indication.cpf}
                                        </p>
                                        <p>
                                          <strong>Telefone:</strong>{" "}
                                          {indication.indication.phone}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {indication.property && (
                                    <div>
                                      <h4 className="font-semibold">
                                        Propriedade
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <p>
                                          <strong>Tipo:</strong>{" "}
                                          {indication.property.type}
                                        </p>
                                        <p>
                                          <strong>Valor:</strong> R${" "}
                                          {indication.property.value?.toLocaleString(
                                            "pt-BR"
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4">
                                    <Badge
                                      className={
                                        statusColors[
                                          indication.status as keyof typeof statusColors
                                        ]
                                      }
                                    >
                                      {
                                        statusLabels[
                                          indication.status as keyof typeof statusLabels
                                        ]
                                      }
                                    </Badge>
                                    <Badge
                                      variant={
                                        indication.isClient
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {indication.isClient
                                        ? "Cliente"
                                        : "Não Cliente"}
                                    </Badge>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        {/* Header */}
      </div>
    </ProtectedPage>
  );
}

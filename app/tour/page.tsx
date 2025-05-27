"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Building2, Loader2, AlertCircle, Save } from "lucide-react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { ProtectedPage } from "@/components/ProtectedPage";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  facade?: string;
  metadata?: {
    tour?: string;
  };
}

export default function TourPage() {

  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth("/api/properties/tour");

        if (!res.ok) throw new Error("Falha ao carregar as propriedades");

        const data = await res.json();
        setProperties(data);
        setInputValues(
          data.reduce((acc: Record<string, string>, item: Property) => {
            acc[item.id] = item.metadata?.tour || "";
            return acc;
          }, {})
        );
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Erro ao buscar propriedades");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((property) =>
      property.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, properties]);

  const handleSave = async (id: string) => {
    try {
      const value = inputValues[id];
      const res = await fetchWithAuth(`/api/properties/tour/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tour: value }),
      });

      if (!res.ok) throw new Error("Erro ao salvar o tour");

      toast.success("Tour salvo com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar o tour");
      console.log(error);
    }
  };

  return (
    <ProtectedPage permissionKey="VIDEO">
      <div className="container mx-auto py-8 px-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Tours Virtuais
                </CardTitle>
                <CardDescription>
                  Gerencie os links de tour virtual dos empreendimentos
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full md:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Separator className="my-4" />
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Carregando empreendimentos...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-8 w-8 text-destructive mb-4" />
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className="w-[100px]">Fachada</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Tour</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((property) => (
                        <TableRow key={property.id} className="hover:bg-muted/50">
                          <TableCell>
                            {property.facade ? (
                              <div className="relative h-16 w-20 overflow-hidden rounded-md border">
                                <Image
                                  src={property.facade || "/placeholder.svg"}
                                  alt={property.title}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-16 w-20 bg-muted rounded-md border">
                                <Building2 className="h-6 w-6 text-muted-foreground opacity-50" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{property.title}</TableCell>
                          <TableCell>
                            <Input
                              placeholder="URL do tour"
                              value={inputValues[property.id] || ""}
                              onChange={(e) =>
                                setInputValues((prev) => ({
                                  ...prev,
                                  [property.id]: e.target.value,
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" className="gap-1" onClick={() => handleSave(property.id)}>
                              <Save className="h-4 w-4" />
                              Salvar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedPage>
  );
}

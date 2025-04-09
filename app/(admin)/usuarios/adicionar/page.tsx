"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/store/useUserStore";

export default function AdicionarUsuarioPage() {
  const router = useRouter();
  const { metadata } = useUserStore();
  const permission = metadata?.permission;

  useEffect(() => {
    if (permission !== "admin") {
      router.push("/unauthorized");
    }
  }, [permission]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao criar usuário");

      router.push("/home");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pl-24">
      <Card className="p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Adicionar Usuário</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2">
              Nome
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="cpf" className="mb-2">
              CPF
            </Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => handleChange("cpf", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="role" className="mb-2">
              Função
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cac">CAC & R.I</SelectItem>
                <SelectItem value="cac senior">
                  Coordenação CAC & R.I
                </SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="cac analyst">CAC (Obras)</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Adicionando..." : "Adicionar Usuário"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

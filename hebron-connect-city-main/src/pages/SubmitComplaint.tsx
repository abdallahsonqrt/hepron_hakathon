import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Droplets, Zap, Route, Trash2, HelpCircle, MapPin } from "lucide-react";

const types = [
  { value: "water", key: "categories.water", icon: Droplets },
  { value: "electricity", key: "categories.electricity", icon: Zap },
  { value: "roads", key: "categories.roads", icon: Route },
  { value: "waste", key: "categories.waste", icon: Trash2 },
  { value: "other", key: "form.other", icon: HelpCircle },
];

const SubmitComplaint = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", phone: "", type: "", description: "", location: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) { setError(t("form.descRequired")); return; }
    setError("");
    setSuccess(true);
    setForm({ name: "", phone: "", type: "", description: "", location: "" });
    setTimeout(() => setSuccess(false), 4000);
  };

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <main className="container mx-auto max-w-xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold">{t("form.title")}</h1>
      <p className="mt-1 text-muted-foreground">{t("form.subtitle")}</p>

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-primary/30 bg-secondary p-4 text-secondary-foreground animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          {t("form.success")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input id="name" placeholder={t("form.optional")} value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("form.phone")}</Label>
            <Input id="phone" placeholder={t("form.optional")} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>{t("form.type")}</Label>
          <Select value={form.type} onValueChange={(v) => update("type", v)}>
            <SelectTrigger>
              <SelectValue placeholder={t("form.selectType")} />
            </SelectTrigger>
            <SelectContent>
              {types.map(({ value, key, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {t(key)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="desc">{t("form.description")} <span className="text-destructive">*</span></Label>
          <Textarea id="desc" rows={4} placeholder={t("form.describePlaceholder")} value={form.description} onChange={(e) => update("description", e.target.value)} />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location" className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {t("form.location")}</Label>
          <Input id="location" placeholder={t("form.locationPlaceholder")} value={form.location} onChange={(e) => update("location", e.target.value)} />
        </div>

        <Button type="submit" size="lg" className="w-full">{t("form.submit")}</Button>
      </form>
    </main>
  );
};

export default SubmitComplaint;

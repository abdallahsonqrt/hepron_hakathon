import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, Route, Trash2, MessageSquarePlus } from "lucide-react";

const categories = [
  { icon: Droplets, key: "water", color: "text-blue-500" },
  { icon: Zap, key: "electricity", color: "text-amber-500" },
  { icon: Route, key: "roads", color: "text-orange-600" },
  { icon: Trash2, key: "waste", color: "text-emerald-600" },
];

const Index = () => {
  const { t } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-16">
      <section className="mx-auto max-w-2xl text-center animate-fade-in">
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
          {t("home.title")}
          <span className="block text-primary">{t("home.city")}</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("home.description")}</p>
        <Link to="/submit" className="mt-8 inline-block">
          <Button size="lg" className="gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            {t("home.cta")}
          </Button>
        </Link>
      </section>

      <section className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map(({ icon: Icon, key, color }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <Icon className={`h-8 w-8 ${color}`} />
            <span className="text-sm font-medium">{t(`categories.${key}`)}</span>
          </div>
        ))}
      </section>
    </main>
  );
};

export default Index;

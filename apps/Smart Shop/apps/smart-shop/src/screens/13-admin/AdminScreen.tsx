import { useEffect, useMemo, useState } from "react";
import {
  AppShell,
  Button,
  Header,
} from "@smart-shop/shared";
import "@smart-shop/shared/styles/tokens.css";
import type { ScreenNavigationProps } from "../../navigation/screenNavigation";
import { useAppState } from "../../state/AppProvider";
import { isAdminEmail } from "../../auth/adminAccess";
import {
  adminStatistics,
  loadAdminData,
  saveAdminData,
  type AdminCategory,
  type AdminData,
  type AdminOffer,
  type AdminProduct,
  type AdminRestaurant,
  type AdminStore,
  type AdminUser,
} from "../../services/adminStore";

type AdminSectionId =
  | "products"
  | "categories"
  | "stores"
  | "restaurants"
  | "offers"
  | "users"
  | "statistics";

const ADMIN_SECTIONS: ReadonlyArray<{ id: AdminSectionId; title: string }> = [
  { id: "products", title: "Produkte" },
  { id: "categories", title: "Kategorien" },
  { id: "stores", title: "Geschäfte" },
  { id: "restaurants", title: "Restaurants" },
  { id: "offers", title: "Angebote" },
  { id: "users", title: "Benutzer" },
  { id: "statistics", title: "Statistik" },
];

function AdminHubCard({
  title,
  count,
  onClick,
}: {
  title: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40"
    >
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs font-bold text-primary">
        {count !== undefined ? `${count} · Öffnen` : "Öffnen"}
      </span>
    </button>
  );
}

function ListRow({
  title,
  subtitle,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg px-2 py-1 text-xs font-bold text-primary"
      >
        Bearbeiten
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg px-2 py-1 text-xs font-bold text-muted-foreground"
      >
        Löschen
      </button>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-sm font-bold text-primary">{value}</span>
    </div>
  );
}

function EmptyListMessage() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-sm text-muted-foreground">Keine Einträge</p>
    </div>
  );
}

export function AdminScreen({ onBack, onNavigateRoot }: ScreenNavigationProps = {}) {
  const { session } = useAppState();
  const isAdmin = isAdminEmail(session.user?.email);

  useEffect(() => {
    if (!isAdmin) {
      onNavigateRoot?.("05-dashboard");
    }
  }, [isAdmin, onNavigateRoot]);

  const [data, setData] = useState<AdminData>(() => loadAdminData());
  const [section, setSection] = useState<AdminSectionId | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formExtra, setFormExtra] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formNormalPrice, setFormNormalPrice] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    label: string;
    onConfirm: () => void;
  } | null>(null);

  const stats = useMemo(() => adminStatistics(data), [data]);

  if (!isAdmin) {
    return null;
  }

  const persist = (next: AdminData) => {
    setData(next);
    saveAdminData(next);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName("");
    setFormExtra("");
    setFormPrice("");
    setFormNormalPrice("");
    setFormEmail("");
  };

  const sectionTitle = ADMIN_SECTIONS.find((item) => item.id === section)?.title ?? "Admin";

  const startCreate = () => {
    resetForm();
    setEditingId("new");
  };

  const startEditProduct = (item: AdminProduct) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormExtra(item.category);
  };

  const startEditCategory = (item: AdminCategory) => {
    setEditingId(item.id);
    setFormName(item.name);
  };

  const startEditStore = (item: AdminStore) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormExtra(item.address);
    setFormEmail(item.city);
  };

  const startEditRestaurant = (item: AdminRestaurant) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormExtra(item.address);
    setFormEmail(item.cuisine ?? "");
  };

  const startEditOffer = (item: AdminOffer) => {
    setEditingId(item.id);
    setFormName(item.productName);
    setFormExtra(item.merchantName);
    setFormPrice(String(item.offerPrice));
    setFormNormalPrice(String(item.normalPrice));
    setFormEmail(item.category);
  };

  const startEditUser = (item: AdminUser) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormEmail(item.email);
    setFormExtra(item.role);
  };

  const saveProduct = () => {
    if (!formName.trim()) {
      return;
    }
    if (editingId === "new") {
      persist({
        ...data,
        products: [
          ...data.products,
          { id: `prod-${Date.now()}`, name: formName.trim(), category: formExtra.trim() || "Sonstiges" },
        ],
      });
    } else if (editingId) {
      persist({
        ...data,
        products: data.products.map((item) =>
          item.id === editingId
            ? { ...item, name: formName.trim(), category: formExtra.trim() || item.category }
            : item,
        ),
      });
    }
    resetForm();
  };

  const saveCategory = () => {
    if (!formName.trim()) {
      return;
    }
    if (editingId === "new") {
      persist({
        ...data,
        categories: [
          ...data.categories,
          { id: `cat-${Date.now()}`, name: formName.trim() },
        ],
      });
    } else if (editingId) {
      persist({
        ...data,
        categories: data.categories.map((item) =>
          item.id === editingId ? { ...item, name: formName.trim() } : item,
        ),
      });
    }
    resetForm();
  };

  const saveStore = () => {
    if (!formName.trim()) {
      return;
    }
    if (editingId === "new") {
      persist({
        ...data,
        stores: [
          ...data.stores,
          {
            id: `store-${Date.now()}`,
            name: formName.trim(),
            address: formExtra.trim(),
            city: formEmail.trim() || "St. Pölten",
          },
        ],
      });
    } else if (editingId) {
      persist({
        ...data,
        stores: data.stores.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: formName.trim(),
                address: formExtra.trim(),
                city: formEmail.trim() || item.city,
              }
            : item,
        ),
      });
    }
    resetForm();
  };

  const saveRestaurant = () => {
    if (!formName.trim()) {
      return;
    }
    if (editingId === "new") {
      persist({
        ...data,
        restaurants: [
          ...data.restaurants,
          {
            id: `rest-${Date.now()}`,
            name: formName.trim(),
            address: formExtra.trim(),
            cuisine: formEmail.trim() || undefined,
          },
        ],
      });
    } else if (editingId) {
      persist({
        ...data,
        restaurants: data.restaurants.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: formName.trim(),
                address: formExtra.trim(),
                cuisine: formEmail.trim() || item.cuisine,
              }
            : item,
        ),
      });
    }
    resetForm();
  };

  const saveOffer = () => {
    if (!formName.trim() || !formExtra.trim()) {
      return;
    }
    const offerPrice = Number(formPrice) || 0;
    const normalPrice = Number(formNormalPrice) || offerPrice;
    if (editingId === "new") {
      persist({
        ...data,
        offers: [
          ...data.offers,
          {
            id: `offer-${Date.now()}`,
            merchantName: formExtra.trim(),
            productName: formName.trim(),
            category: formEmail.trim() || "Sonstiges",
            offerPrice,
            normalPrice,
          },
        ],
      });
    } else if (editingId) {
      persist({
        ...data,
        offers: data.offers.map((item) =>
          item.id === editingId
            ? {
                ...item,
                merchantName: formExtra.trim(),
                productName: formName.trim(),
                category: formEmail.trim() || item.category,
                offerPrice,
                normalPrice,
              }
            : item,
        ),
      });
    }
    resetForm();
  };

  const saveUser = () => {
    if (!formName.trim() || !formEmail.trim()) {
      return;
    }
    const role = formExtra === "admin" ? "admin" : "user";
    if (editingId === "new") {
      persist({
        ...data,
        users: [
          ...data.users,
          { id: `user-${Date.now()}`, name: formName.trim(), email: formEmail.trim(), role },
        ],
      });
    } else if (editingId) {
      persist({
        ...data,
        users: data.users.map((item) =>
          item.id === editingId
            ? { ...item, name: formName.trim(), email: formEmail.trim(), role }
            : item,
        ),
      });
    }
    resetForm();
  };

  const deleteFrom = <T extends { id: string }>(list: T[], id: string): T[] =>
    list.filter((item) => item.id !== id);

  const renderForm = () => {
    if (!editingId || section === "statistics") {
      return null;
    }

    const inputClass =
      "w-full rounded-xl border border-border bg-secondary/20 px-3.5 py-3 text-sm text-foreground focus:outline-none";

    return (
      <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs font-bold text-foreground">
          {editingId === "new" ? "Neu anlegen" : "Bearbeiten"}
        </p>
        {section === "products" ? (
          <>
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Produktname" className={inputClass} />
            <input value={formExtra} onChange={(e) => setFormExtra(e.target.value)} placeholder="Kategorie" className={inputClass} />
            <div className="flex gap-2">
              <Button onClick={saveProduct}>Speichern</Button>
              <Button variant="secondary" onClick={resetForm}>Abbrechen</Button>
            </div>
          </>
        ) : null}
        {section === "categories" ? (
          <>
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Kategoriename" className={inputClass} />
            <div className="flex gap-2">
              <Button onClick={saveCategory}>Speichern</Button>
              <Button variant="secondary" onClick={resetForm}>Abbrechen</Button>
            </div>
          </>
        ) : null}
        {section === "stores" ? (
          <>
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name" className={inputClass} />
            <input value={formExtra} onChange={(e) => setFormExtra(e.target.value)} placeholder="Adresse" className={inputClass} />
            <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Stadt" className={inputClass} />
            <div className="flex gap-2">
              <Button onClick={saveStore}>Speichern</Button>
              <Button variant="secondary" onClick={resetForm}>Abbrechen</Button>
            </div>
          </>
        ) : null}
        {section === "restaurants" ? (
          <>
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name" className={inputClass} />
            <input value={formExtra} onChange={(e) => setFormExtra(e.target.value)} placeholder="Adresse" className={inputClass} />
            <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Küche" className={inputClass} />
            <div className="flex gap-2">
              <Button onClick={saveRestaurant}>Speichern</Button>
              <Button variant="secondary" onClick={resetForm}>Abbrechen</Button>
            </div>
          </>
        ) : null}
        {section === "offers" ? (
          <>
            <input value={formExtra} onChange={(e) => setFormExtra(e.target.value)} placeholder="Händler" className={inputClass} />
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Produkt" className={inputClass} />
            <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Kategorie" className={inputClass} />
            <input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="Angebotspreis" type="number" className={inputClass} />
            <input value={formNormalPrice} onChange={(e) => setFormNormalPrice(e.target.value)} placeholder="Normalpreis" type="number" className={inputClass} />
            <div className="flex gap-2">
              <Button onClick={saveOffer}>Speichern</Button>
              <Button variant="secondary" onClick={resetForm}>Abbrechen</Button>
            </div>
          </>
        ) : null}
        {section === "users" ? (
          <>
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name" className={inputClass} />
            <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="E-Mail" className={inputClass} />
            <select value={formExtra} onChange={(e) => setFormExtra(e.target.value)} className={inputClass}>
              <option value="user">Benutzer</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={saveUser}>Speichern</Button>
              <Button variant="secondary" onClick={resetForm}>Abbrechen</Button>
            </div>
          </>
        ) : null}
      </div>
    );
  };

  const renderSectionContent = () => {
    if (!section) {
      return null;
    }

    if (section === "statistics") {
      return (
        <div className="space-y-2">
          <StatRow label="Produkte" value={stats.products} />
          <StatRow label="Kategorien" value={stats.categories} />
          <StatRow label="Geschäfte" value={stats.stores} />
          <StatRow label="Restaurants" value={stats.restaurants} />
          <StatRow label="Angebote" value={stats.offers} />
          <StatRow label="Benutzer" value={stats.users} />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {renderForm()}
        <Button variant="secondary" onClick={startCreate}>
          Hinzufügen
        </Button>
        {section === "products"
          ? data.products.length === 0
            ? <EmptyListMessage />
            : data.products.map((item) => (
              <ListRow
                key={item.id}
                title={item.name}
                subtitle={item.category}
                onEdit={() => startEditProduct(item)}
                onDelete={() =>
                  setDeleteTarget({
                    label: item.name,
                    onConfirm: () => {
                      persist({ ...data, products: deleteFrom(data.products, item.id) });
                      setDeleteTarget(null);
                    },
                  })
                }
              />
            ))
          : null}
        {section === "categories"
          ? data.categories.length === 0
            ? <EmptyListMessage />
            : data.categories.map((item) => (
              <ListRow
                key={item.id}
                title={item.name}
                onEdit={() => startEditCategory(item)}
                onDelete={() =>
                  setDeleteTarget({
                    label: item.name,
                    onConfirm: () => {
                      persist({ ...data, categories: deleteFrom(data.categories, item.id) });
                      setDeleteTarget(null);
                    },
                  })
                }
              />
            ))
          : null}
        {section === "stores"
          ? data.stores.length === 0
            ? <EmptyListMessage />
            : data.stores.map((item) => (
              <ListRow
                key={item.id}
                title={item.name}
                subtitle={`${item.address}, ${item.city}`}
                onEdit={() => startEditStore(item)}
                onDelete={() =>
                  setDeleteTarget({
                    label: item.name,
                    onConfirm: () => {
                      persist({ ...data, stores: deleteFrom(data.stores, item.id) });
                      setDeleteTarget(null);
                    },
                  })
                }
              />
            ))
          : null}
        {section === "restaurants"
          ? data.restaurants.length === 0
            ? <EmptyListMessage />
            : data.restaurants.map((item) => (
              <ListRow
                key={item.id}
                title={item.name}
                subtitle={item.address}
                onEdit={() => startEditRestaurant(item)}
                onDelete={() =>
                  setDeleteTarget({
                    label: item.name,
                    onConfirm: () => {
                      persist({ ...data, restaurants: deleteFrom(data.restaurants, item.id) });
                      setDeleteTarget(null);
                    },
                  })
                }
              />
            ))
          : null}
        {section === "offers"
          ? data.offers.length === 0
            ? <EmptyListMessage />
            : data.offers.map((item) => (
              <ListRow
                key={item.id}
                title={item.productName}
                subtitle={`${item.merchantName} · €${item.offerPrice.toFixed(2)}`}
                onEdit={() => startEditOffer(item)}
                onDelete={() =>
                  setDeleteTarget({
                    label: item.productName,
                    onConfirm: () => {
                      persist({ ...data, offers: deleteFrom(data.offers, item.id) });
                      setDeleteTarget(null);
                    },
                  })
                }
              />
            ))
          : null}
        {section === "users"
          ? data.users.length === 0
            ? <EmptyListMessage />
            : data.users.map((item) => (
              <ListRow
                key={item.id}
                title={item.name}
                subtitle={`${item.email} · ${item.role}`}
                onEdit={() => startEditUser(item)}
                onDelete={() =>
                  setDeleteTarget({
                    label: item.name,
                    onConfirm: () => {
                      persist({ ...data, users: deleteFrom(data.users, item.id) });
                      setDeleteTarget(null);
                    },
                  })
                }
              />
            ))
          : null}
      </div>
    );
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Header
          title={section ? sectionTitle : "Admin"}
          subtitle="Pilot-Daten verwalten"
          onBack={
            section
              ? () => {
                  resetForm();
                  setSection(null);
                }
              : onBack
          }
        />

        <div className="flex-1 space-y-2 px-5 pt-4 pb-5">
          {!section
            ? ADMIN_SECTIONS.map((item) => (
                <AdminHubCard
                  key={item.id}
                  title={item.title}
                  count={
                    item.id === "statistics"
                      ? undefined
                      : stats[item.id as keyof typeof stats]
                  }
                  onClick={() => setSection(item.id)}
                />
              ))
            : renderSectionContent()}
        </div>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
            <h2
              className="text-lg font-black text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Löschen
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              „{deleteTarget.label}" wirklich löschen?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Abbrechen
              </Button>
              <Button onClick={deleteTarget.onConfirm}>Löschen</Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

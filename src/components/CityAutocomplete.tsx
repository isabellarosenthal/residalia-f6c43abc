import { useState, useMemo, useEffect } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const CIUDADES_CENTROAMERICA = [
  { country: "Guatemala", cities: [
    "Guatemala", "Quetzaltenango", "Escuintla", "Villa Nueva", "Mixco", "San Juan Sacatepéquez",
    "San Miguel Petapa", "Santa Catarina Pinula", "Chinautla", "Amatitlán", "Antigua Guatemala",
    "Huehuetenango", "Cobán", "Totonicapán", "San Marcos", "Puerto San José", "Jutiapa", "Chimaltenango",
  ]},
  { country: "Belice", cities: [
    "Belize City", "Belmopan", "San Ignacio", "Orange Walk", "Dangriga", "Corozal", "San Pedro", "Punta Gorda",
  ]},
  { country: "El Salvador", cities: [
    "San Salvador", "Santa Ana", "San Miguel", "Soyapango", "Santa Tecla", "Mejicanos", "Apopa", "Delgado",
    "Ilopango", "San Martín", "Ahuachapán", "Sonsonate", "Usulután", "Cojutepeque", "Zacatecoluca", "La Unión",
    "Chalatenango", "San Vicente", "Nueva San Salvador", "Metapán",
  ]},
  { country: "Honduras", cities: [
    "Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choluteca", "Comayagüela", "El Progreso", "Danlí",
    "Puerto Cortés", "Siguatepeque", "Juticalpa", "Catacamas", "Tocoa", "Olanchito", "Santa Rosa de Copán",
    "Comayagua", "La Lima", "Villanueva", "Potrerillos", "Cofradía", "Talanga", "Nacaome", "Yoro",
  ]},
  { country: "Nicaragua", cities: [
    "Managua", "León", "Granada", "Masaya", "Chinandega", "Matagalpa", "Estelí", "Tipitapa", "Jinotega",
    "Ciudad Sandino", "Rivas", "Jinotepe", "Bluefields", "Puerto Cabezas", "Somoto", "Boaco", "Juigalpa",
  ]},
  { country: "Costa Rica", cities: [
    "San José", "Alajuela", "Cartago", "Heredia", "Limón", "Puntarenas", "Liberia", "Escazú", "Desamparados",
    "Tibás", "Moravia", "Curridabat", "Goicoechea", "La Unión", "Belén", "Santa Ana", "Grecia", "San Ramón",
    "Quepos", "Puntarenas", "Nicoya", "Siquirres", "Tilarán", "Cañas", "Liberia",
  ]},
  { country: "Panamá", cities: [
    "Panamá", "Colón", "David", "Santiago", "Chitré", "La Chorrera", "Penonomé", "Las Tablas", "Bocas del Toro",
    "Aguadulce", "Antón", "Bugaba", "Capira", "Chepo", "El Porvenir", "La Villa", "Los Santos", "Pacora",
    "Pedregal", "Portobelo", "Puerto Armuelles", "San Miguelito", "Soná", "Vista Alegre",
  ]},
];

const FLAT_CITIES = CIUDADES_CENTROAMERICA.flatMap((g) => g.cities.map((c) => ({ label: c, country: g.country })));

type CityAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function CityAutocomplete({ value, onChange, placeholder = "Buscar ciudad…", className }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => { setInputValue(value); }, [value]);

  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return CIUDADES_CENTROAMERICA;
    return CIUDADES_CENTROAMERICA.map((g) => ({
      ...g,
      cities: g.cities.filter((c) => c.toLowerCase().includes(q)),
    })).filter((g) => g.cities.length > 0);
  }, [inputValue]);

  const isKnown = FLAT_CITIES.some((c) => c.label.toLowerCase() === inputValue.trim().toLowerCase());

  const handleSelect = (city: string) => {
    setInputValue(city);
    onChange(city);
    setOpen(false);
  };

  const handleBlur = () => {
    if (!isKnown && inputValue.trim()) {
      // allow custom city text
      onChange(inputValue.trim());
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4A154B]",
            className,
          )}
        >
          <span className={value ? "text-[#0F172A]" : "text-[#94A3B8]"}>{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            placeholder="Escribe la ciudad…"
            className="h-9"
          />
          <CommandList className="max-h-[260px]">
            <CommandEmpty>
              {inputValue.trim() ? (
                <div className="px-2 py-2 text-xs text-[#64748B]">
                  No encontrada. Se usará "<b>{inputValue.trim()}</b>".
                </div>
              ) : (
                "Escribe para buscar"
              )}
            </CommandEmpty>
            {filtered.map((group) => (
              <CommandGroup key={group.country} heading={group.country}>
                {group.cities.map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => handleSelect(city)}
                    className="cursor-pointer"
                  >
                    <span className="flex-1">{city}</span>
                    {value === city && <Check className="ml-auto h-4 w-4 text-[#4A154B]" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { CIUDADES_CENTROAMERICA };

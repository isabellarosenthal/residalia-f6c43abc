// Departamentos y principales municipios de Honduras
export const HONDURAS: Record<string, string[]> = {
  "Atlántida": ["La Ceiba", "Tela", "El Porvenir", "Jutiapa", "La Másica", "San Francisco", "Esparta", "Arizona"],
  "Choluteca": ["Choluteca", "Marcovia", "Pespire", "El Triunfo", "San Marcos de Colón", "Apacilagua", "Concepción de María", "Duyure", "El Corpus", "Morolica", "Namasigüe", "Orocuina", "Santa Ana de Yusguare"],
  "Colón": ["Trujillo", "Tocoa", "Sonaguera", "Sabá", "Bonito Oriental", "Iriona", "Limón", "Santa Fe", "Santa Rosa de Aguán", "Balfate"],
  "Comayagua": ["Comayagua", "Siguatepeque", "La Paz", "Villa de San Antonio", "El Rosario", "Ajuterique", "Lejamaní", "Las Lajas", "Esquías", "Humuya", "Lamaní", "La Libertad", "La Trinidad", "Meámbar", "Minas de Oro", "Ojos de Agua", "San Jerónimo", "San José de Comayagua", "San José del Potrero", "San Luis", "San Sebastián", "Taulabé"],
  "Copán": ["Santa Rosa de Copán", "Copán Ruinas", "La Entrada", "Cucuyagua", "Corquín", "Dolores", "Concepción", "Dulce Nombre", "El Paraíso", "Florida", "La Jigua", "La Unión", "Nueva Arcadia", "San Agustín", "San Antonio", "San Jerónimo", "San José", "San Juan de Opoa", "San Nicolás", "San Pedro", "Santa Rita", "Trinidad de Copán", "Veracruz"],
  "Cortés": ["San Pedro Sula", "Choloma", "Villanueva", "La Lima", "Puerto Cortés", "Omoa", "Pimienta", "Potrerillos", "San Antonio de Cortés", "San Francisco de Yojoa", "San Manuel", "Santa Cruz de Yojoa"],
  "El Paraíso": ["Yuscarán", "Danlí", "El Paraíso", "Alauca", "Güinope", "Jacaleapa", "Liure", "Morocelí", "Oropolí", "Potrerillos", "San Antonio de Flores", "San Lucas", "San Matías", "Soledad", "Teupasenti", "Texiguat", "Vado Ancho", "Yauyupe", "Trojes"],
  "Francisco Morazán": ["Tegucigalpa", "Comayagüela", "Valle de Ángeles", "Santa Lucía", "Cedros", "Curarén", "El Porvenir", "Guaimaca", "La Libertad", "La Venta", "Lepaterique", "Maraita", "Marale", "Nueva Armenia", "Ojojona", "Orica", "Reitoca", "Sabanagrande", "San Antonio de Oriente", "San Buenaventura", "San Ignacio", "San Juan de Flores", "San Miguelito", "Talanga", "Tatumbla", "Vallecillo", "Villa de San Francisco", "Alubarén"],
  "Gracias a Dios": ["Puerto Lempira", "Brus Laguna", "Ahuas", "Juan Francisco Bulnes", "Ramón Villeda Morales", "Wampusirpi"],
  "Intibucá": ["La Esperanza", "Intibucá", "Camasca", "Colomoncagua", "Concepción", "Dolores", "Jesús de Otoro", "Magdalena", "Masaguara", "San Antonio", "San Francisco de Opalaca", "San Isidro", "San Juan", "San Marcos de la Sierra", "San Miguel Guancapla", "Santa Lucía", "Yamaranguila"],
  "Islas de la Bahía": ["Roatán", "Coxen Hole", "French Harbour", "Oak Ridge", "West End", "West Bay", "Sandy Bay", "Guanaja", "Utila", "José Santos Guardiola"],
  "La Paz": ["La Paz", "Marcala", "Aguanqueterique", "Cabañas", "Cane", "Chinacla", "Guajiquiro", "Lauterique", "Mercedes de Oriente", "Opatoro", "San Antonio del Norte", "San José", "San Juan", "San Pedro de Tutule", "Santa Ana", "Santa Elena", "Santa María", "Santiago de Puringla", "Yarula"],
  "Lempira": ["Gracias", "Lepaera", "Belén", "Candelaria", "Cololaca", "Erandique", "Gualcince", "Guarita", "La Campa", "La Iguala", "La Unión", "La Virtud", "Las Flores", "Mapulaca", "Piraera", "San Andrés", "San Francisco", "San Juan Guarita", "San Manuel Colohete", "San Marcos de Caiquín", "San Rafael", "San Sebastián", "Santa Cruz", "Talgua", "Tambla", "Tomalá", "Valladolid", "Virginia"],
  "Ocotepeque": ["Nueva Ocotepeque", "Sinuapa", "Belén Gualcho", "Concepción", "Dolores Merendón", "Fraternidad", "La Encarnación", "La Labor", "Lucerna", "Mercedes", "San Fernando", "San Francisco del Valle", "San Jorge", "San Marcos", "Santa Fe"],
  "Olancho": ["Juticalpa", "Catacamas", "Campamento", "Concordia", "Dulce Nombre de Culmí", "El Rosario", "Esquipulas del Norte", "Gualaco", "Guarizama", "Guata", "Guayape", "Jano", "La Unión", "Mangulile", "Manto", "Patuca", "Salamá", "San Esteban", "San Francisco de Becerra", "San Francisco de la Paz", "Santa María del Real", "Silca", "Yocón"],
  "Santa Bárbara": ["Santa Bárbara", "Trinidad", "Quimistán", "San Nicolás", "Arada", "Atima", "Azacualpa", "Ceguaca", "Concepción del Norte", "Concepción del Sur", "Chinda", "El Níspero", "Gualala", "Ilama", "Las Vegas", "Macuelizo", "Naranjito", "Nuevo Celilac", "Petoa", "Protección", "San Francisco de Ojuera", "San José de Colinas", "San Luis", "San Marcos", "San Pedro Zacapa", "San Vicente Centenario", "Santa Rita"],
  "Valle": ["Nacaome", "San Lorenzo", "Amapala", "Aramecina", "Caridad", "Goascorán", "Langue", "San Francisco de Coray", "Alianza"],
  "Yoro": ["Yoro", "El Progreso", "Olanchito", "Morazán", "Sulaco", "Arenal", "El Negrito", "Jocón", "Santa Rita", "Victoria", "Yorito"],
};

export const DEPARTAMENTOS = Object.keys(HONDURAS).sort((a, b) => a.localeCompare(b, "es"));

export const ciudadesDe = (depto: string | null | undefined): string[] =>
  (depto && HONDURAS[depto]) ? [...HONDURAS[depto]].sort((a, b) => a.localeCompare(b, "es")) : [];

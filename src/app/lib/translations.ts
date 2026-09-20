export type Lang = "es" | "ca";

export const translations = {
  es: {
    // Header
    shuffle: "Orden aleatorio",
    upload: "Subir",
    login: "Iniciar sesión",
    register: "Registrarse",
    logout: "Salir",
    profile: "Mi perfil",

    // Category bar
    verTodas: "ver todas",
    newCategory: "nueva categoría...",

    // Empty state
    emptyFolder: "Esta carpeta está vacía.",
    emptyNoImages: "No hay imágenes todavía.",
    emptyNoImagesInCat: "No hay imágenes en",
    emptyComeBack: "Volvé pronto.",

    // Gallery
    loading: "Cargando...",
    loadingMore: "Cargando más...",
    shuffling: "Mezclando...",
    errorLoad: "No se pudieron cargar las imágenes.",

    // Lightbox
    uploadedBy: "Subido por",
    uploadedAt: "Subido",
    source: "Fuente",
    description: "Descripción",
    title: "Título",
    categories: "Categorías",
    edit: "Editar",

    // Upload modal
    uploadTitle: "Subir imagen",
    uploadFile: "Archivo",
    uploadTitleField: "Título",
    uploadDesc: "Descripción",
    uploadDescOptional: "opcional",
    uploadSource: "Fuente / link original",
    uploadVisibility: "Visibilidad",
    uploadPublic: "público",
    uploadPrivate: "privado",
    uploadCategories: "Categorías",
    uploadCategoriesHint: "seleccioná una o más",
    uploadDropHint: "Hacé clic o arrastrá una imagen aquí",
    uploadDropFormats: "JPG, PNG, GIF, WEBP · máx 10MB",
    uploadCancel: "Cancelar",
    uploadSubmit: "Subir",
    uploading: "Subiendo...",
    uploadLoadingCats: "Cargando categorías...",
    uploadErrorFile: "Solo se permiten imágenes.",
    uploadErrorSize: "Archivo demasiado grande. Máx 10MB.",
    uploadErrorSelect: "Seleccioná una imagen.",

    // Edit modal
    editTitle: "Editar imagen",
    editSave: "Guardar",
    editSaving: "Guardando...",
    editDelete: "Eliminar",
    editConfirm: "¿Segura?",
    editConfirmYes: "Sí, eliminar",
    editConfirmNo: "No",

    // Login modal
    loginTitle: "Inicio de Sesión",
    loginUser: "Usuario o email:",
    loginPass: "Contraseña:",
    loginSubmit: "Entrar",
    loginCancel: "Cancelar",
    loginError: "Usuario o contraseña incorrectos.",
    loginFill: "Completá todos los campos.",

    // Register modal
    registerTitle: "Registro",
    registerUser: "Nombre de usuario:",
    registerEmail: "Email:",
    registerPass: "Contraseña",
    registerPassHint: "mín. 8 caracteres",
    registerSubmit: "Registrarse",
    registerCancel: "Cancelar",
    registerFill: "Completá todos los campos.",

    // Profile page
    profileTitle: "Mi perfil",
    profileBack: "← Volver al inicio",
    profileAccount: "Información de cuenta",
    profileUsername: "Usuario",
    profileEmail: "Email",
    profileMember: "Miembro desde",
    profileEdit: "Editar perfil",
    profileDisplayName: "Nombre para mostrar",
    profileDisplayNameHint: "aparece en imágenes subidas",
    profileBio: "Bio",
    profileBioPlaceholder: "Contá algo sobre vos...",
    profileBirthday: "Cumpleaños 🎂",
    profileSave: "💾 Guardar",
    profileSaving: "Guardando...",
    profileCancel: "Cancelar",
    profileSuccess: "✓ Perfil actualizado.",
    profileTopCats: "Categorías más usadas",

    // Backlog / admin panel
    backlogTitle: "Backlog del proyecto",
    backlogPending: "pendientes",
    backlogNote: "te odio pero todavía hay cosas por hacer, para consultas, pedidos o quejas consultar a: fridaruizsh@gmail.com",
    backlogGoToNotes: "📌 Ir al tablón de notas",
    backlogItems: [
      "Optimización de galería / paginación",
      "Mejoras de vista galería en mobile",
      "Panel admin — ver usuarios, cambiar roles desde UI",
      "Fuente japonesa + traducción",
      "Banners publicitarios estilo 2000s en la galería",
      "Búsqueda por similitud / vibe (LLM, estilo Pinterest)",
      "Búsqueda inversa de imagen / lector de metadata",
      "Dominio personalizado",
      "Revisión legal — copyright antes de hacer público",
      "Separar portfolio de Lau (home) + CV + /notfound archive",
    ],

    // Notes board
    notesTitle: "Tablón de notas",
    notesBack: "← Volver al perfil",
    notesPlaceholder: "Escribí una nota...",
    notesPublish: "📌 Publicar",
    notesLoading: "Cargando notas...",
    notesEmpty: "No hay notas todavía. ¡Dejá la primera!",
    notesErrorLoad: "Error al cargar notas.",
    notesErrorPost: "Error al publicar nota.",
    notesErrorDelete: "Error al eliminar.",
    notesFileLabel: "📝 nota.txt",

    // Category CRUD
    catRename: "Renombrar",
    catDelete: "Eliminar",
    catAdd: "+",
    catLoading: "Cargando...",
    catErrorLoad: "No se pudieron cargar las categorías.",
    catErrorExists: "Esa categoría ya existe.",
    catErrorCreate: "No se pudo crear la categoría.",
    catErrorRename: "No se pudo renombrar.",
    catErrorDelete: "No se pudo eliminar.",

    // BSOD
    bsodLine1: "A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) +",
    bsodLine2: "00010E36. The current application will be terminated.",
    bsodLine3: "Press any key to terminate the current application.",
    bsodLine4: "Press CTRL+ALT+DEL to restart your computer. You will",
    bsodLine5: "lose any unsaved information in all applications.",
    bsodLine6: "Press any key to continue",
    bsodLoading: "Loading notfound.exe",

    // Default category names
    sinCategoria: "sin categoría",
    arquitectura: "arquitectura",
    disenioIndumentaria: "diseño de indumentaria",
    disenioInteriores: "diseño de interiores",
    disenioGrafico: "diseño gráfico",
    escultura: "escultura",
    fotografia: "fotografía",
    ilustracion: "ilustración",
    nostalgiaFuturista: "nostalgia futurista",
  },

  ca: {
    // Header
    shuffle: "Ordre aleatori",
    upload: "Pujar",
    login: "Iniciar sessió",
    register: "Registrar-se",
    logout: "Sortir",
    profile: "El meu perfil",

    // Category bar
    verTodas: "veure totes",
    newCategory: "nova categoria...",

    // Empty state
    emptyFolder: "Aquesta carpeta és buida.",
    emptyNoImages: "Encara no hi ha imatges.",
    emptyNoImagesInCat: "No hi ha imatges a",
    emptyComeBack: "Torna aviat.",

    // Gallery
    loading: "Carregant...",
    loadingMore: "Carregant més...",
    shuffling: "Barrejant...",
    errorLoad: "No s'han pogut carregar les imatges.",

    // Lightbox
    uploadedBy: "Pujat per",
    uploadedAt: "Pujat",
    source: "Font",
    description: "Descripció",
    title: "Títol",
    categories: "Categories",
    edit: "Editar",

    // Upload modal
    uploadTitle: "Pujar imatge",
    uploadFile: "Arxiu",
    uploadTitleField: "Títol",
    uploadDesc: "Descripció",
    uploadDescOptional: "opcional",
    uploadSource: "Font / enllaç original",
    uploadVisibility: "Visibilitat",
    uploadPublic: "públic",
    uploadPrivate: "privat",
    uploadCategories: "Categories",
    uploadCategoriesHint: "selecciona una o més",
    uploadDropHint: "Fes clic o arrossega una imatge aquí",
    uploadDropFormats: "JPG, PNG, GIF, WEBP · màx 10MB",
    uploadCancel: "Cancel·lar",
    uploadSubmit: "Pujar",
    uploading: "Pujant...",
    uploadLoadingCats: "Carregant categories...",
    uploadErrorFile: "Només es permeten imatges.",
    uploadErrorSize: "Arxiu massa gran. Màx 10MB.",
    uploadErrorSelect: "Selecciona una imatge.",

    // Edit modal
    editTitle: "Editar imatge",
    editSave: "Desar",
    editSaving: "Desant...",
    editDelete: "Eliminar",
    editConfirm: "Segura?",
    editConfirmYes: "Sí, eliminar",
    editConfirmNo: "No",

    // Login modal
    loginTitle: "Inici de Sessió",
    loginUser: "Usuari o email:",
    loginPass: "Contrasenya:",
    loginSubmit: "Entrar",
    loginCancel: "Cancel·lar",
    loginError: "Usuari o contrasenya incorrectes.",
    loginFill: "Omple tots els camps.",

    // Register modal
    registerTitle: "Registre",
    registerUser: "Nom d'usuari:",
    registerEmail: "Email:",
    registerPass: "Contrasenya",
    registerPassHint: "mín. 8 caràcters",
    registerSubmit: "Registrar-se",
    registerCancel: "Cancel·lar",
    registerFill: "Omple tots els camps.",

    // Profile page
    profileTitle: "El meu perfil",
    profileBack: "← Tornar a l'inici",
    profileAccount: "Informació del compte",
    profileUsername: "Usuari",
    profileEmail: "Email",
    profileMember: "Membre des de",
    profileEdit: "Editar perfil",
    profileDisplayName: "Nom per mostrar",
    profileDisplayNameHint: "apareix a les imatges pujades",
    profileBio: "Bio",
    profileBioPlaceholder: "Explica alguna cosa sobre tu...",
    profileBirthday: "Aniversari 🎂",
    profileSave: "💾 Desar",
    profileSaving: "Desant...",
    profileCancel: "Cancel·lar",
    profileSuccess: "✓ Perfil actualitzat.",
    profileTopCats: "Categories més usades",

    // Backlog / admin panel
    backlogTitle: "Backlog del projecte",
    backlogPending: "pendents",
    backlogNote: "t'odio però encara hi ha coses per fer, per consultes, peticions o queixes consultar a: fridaruizsh@gmail.com",
    backlogGoToNotes: "📌 Anar al tauler de notes",
    backlogItems: [
      "Optimització de galeria / paginació",
      "Millores de vista galeria en mòbil",
      "Panell admin — veure usuaris, canviar rols des de la UI",
      "Font japonesa + traducció",
      "Banners publicitaris estil anys 2000 a la galeria",
      "Cerca per similitud / vibe (LLM, estil Pinterest)",
      "Cerca inversa d'imatge / lector de metadades",
      "Domini personalitzat",
      "Revisió legal — copyright abans de fer-ho públic",
      "Separar portfolio d'en Lau (home) + CV + /notfound archive",
    ],

    // Notes board
    notesTitle: "Tauler de notes",
    notesBack: "← Tornar al perfil",
    notesPlaceholder: "Escriu una nota...",
    notesPublish: "📌 Publicar",
    notesLoading: "Carregant notes...",
    notesEmpty: "Encara no hi ha notes. Deixa la primera!",
    notesErrorLoad: "Error en carregar notes.",
    notesErrorPost: "Error en publicar la nota.",
    notesErrorDelete: "Error en eliminar.",
    notesFileLabel: "📝 nota.txt",

    // Category CRUD
    catRename: "Reanomenar",
    catDelete: "Eliminar",
    catAdd: "+",
    catLoading: "Carregant...",
    catErrorLoad: "No s'han pogut carregar les categories.",
    catErrorExists: "Aquesta categoria ja existeix.",
    catErrorCreate: "No s'ha pogut crear la categoria.",
    catErrorRename: "No s'ha pogut reanomenar.",
    catErrorDelete: "No s'ha pogut eliminar.",

    // BSOD
    bsodLine1: "S'ha produït una excepció fatal 0E a 0028:C0011E36 a VXD VMM(01) +",
    bsodLine2: "00010E36. L'aplicació actual serà tancada.",
    bsodLine3: "Prem qualsevol tecla per tancar l'aplicació actual.",
    bsodLine4: "Prem CTRL+ALT+SUPR per reiniciar l'ordinador. Perdràs",
    bsodLine5: "tota la informació no desada de totes les aplicacions.",
    bsodLine6: "Prem qualsevol tecla per continuar",
    bsodLoading: "Carregant notfound.exe",

    // Default category names
    sinCategoria: "sense categoria",
    arquitectura: "arquitectura",
    disenioIndumentaria: "disseny d'indumentària",
    disenioInteriores: "disseny d'interiors",
    disenioGrafico: "disseny gràfic",
    escultura: "escultura",
    fotografia: "fotografia",
    ilustracion: "il·lustració",
    nostalgiaFuturista: "nostàlgia futurista",
  },
} as const;

export type TranslationKey = keyof typeof translations.es;

// Map DB category names to translation keys
export const categoryTranslationMap: Record<string, TranslationKey> = {
  "sin categoría": "sinCategoria",
  "arquitectura": "arquitectura",
  "diseño de indumentaria": "disenioIndumentaria",
  "diseño de interiores": "disenioInteriores",
  "diseño gráfico": "disenioGrafico",
  "escultura": "escultura",
  "fotografía": "fotografia",
  "ilustración": "ilustracion",
  "nostalgia futurista": "nostalgiaFuturista",
  // Catalan reverse map
  "sense categoria": "sinCategoria",
  "disseny d'indumentària": "disenioIndumentaria",
  "disseny d'interiors": "disenioInteriores",
  "disseny gràfic": "disenioGrafico",
  "fotografia": "fotografia",
  "il·lustració": "ilustracion",
  "nostàlgia futurista": "nostalgiaFuturista",
};

export function translateCategory(name: string, lang: Lang): string {
  const key = categoryTranslationMap[name.toLowerCase()];
  if (!key) return name;
  return translations[lang][key] as string;
}
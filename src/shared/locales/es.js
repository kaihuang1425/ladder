/* Ladder - Español.
   Neutral international register: tuteo (tú), no vosotros, and computing
   terms that read naturally in both Spain and Latin America. Standard
   algorithm names keep their English form where that is what appears in
   the problem statements themselves. */
(function (root) {
  'use strict';
  const NS = (root.Ladder = root.Ladder || {});
  NS.LOCALES = NS.LOCALES || {};

  NS.LOCALES.es = {
    /* ---------------------------------------------------------- language */
    'lang.en.note': 'Inglés',
    'lang.zhTW.note': 'Chino tradicional',
    'lang.zhCN.note': 'Chino simplificado',
    'lang.es.note': 'Español',
    'lang.auto': 'Seguir el navegador',

    /* -------------------------------------------------------------- tabs */
    'tab.coach': 'Guía',
    'tab.learn': 'Aprender',
    'tab.code': 'Código',
    'tab.notes': 'Notas',
    'tab.progress': 'Progreso',

    /* ------------------------------------------------------------ header */
    'head.reread': 'Volver a leer el problema de la página',
    'head.dock': 'Anclar junto a la página o dejar flotando',
    'head.theme': 'Claro u oscuro',
    'head.settings': 'Ajustes y claves de API',
    'head.close': 'Cerrar (Ctrl+Shift+L)',
    'head.launcher': 'Abrir Ladder (Ctrl+Shift+L)',
    'head.appName': 'Ladder',

    /* ------------------------------------------------------------- rungs */
    'rung.1.label': '¿Qué me está pidiendo esto?',
    'rung.1.blurb': 'En palabras claras. Sin enfoque ni spoilers.',
    'rung.2.label': 'Dame un empujón',
    'rung.2.blurb': 'Una cosa en la que fijarte y una pregunta para pensar.',
    'rung.3.label': 'Dime qué técnica usar',
    'rung.3.blurb': 'El nombre y por qué encaja. Todavía sin código.',
    'rung.4.label': 'Explícame el plan',
    'rung.4.blurb': 'Pseudocódigo numerado y los casos límite.',
    'rung.5.label': 'Ver la solución completa',
    'rung.5.blurb': 'Código que funciona, línea a línea, y qué llevarte.',

    /* ------------------------------------------------------------- coach */
    'coach.ladder': 'La escalera de pistas',
    'coach.ladderNote': 'Cada peldaño cuenta un poco más. Sube solo lo que ' +
      'necesites: la idea es resolverlo tú.',
    'coach.quick': 'Preguntas rápidas',
    'quick.concepts': '¿Qué necesito aprender primero?',
    'quick.testcases': 'Casos límite que probar',
    'quick.dryrun': 'Recorrer el ejemplo paso a paso',
    'quick.optimize': 'Hacerlo más rápido',

    'msg.author': 'Ladder',
    'msg.hintBadge': 'Pista {n}',
    'msg.reveal': 'Mostrar la solución',
    'msg.stopped': '_(detenido)_',

    'composer.placeholder': 'Pregunta lo que quieras sobre este problema...',
    'composer.send': 'Enviar (Enter)',
    'composer.langTitle': 'Lenguaje de los ejemplos de código',
    'composer.hintState': 'Pista {n} de 5',

    /* ----------------------------------------------------------- notices */
    'notice.setup.title': 'Configuración de un minuto',
    'notice.setup.body': 'Ladder necesita una clave de IA para dar pistas. Google ' +
      'AI Studio regala una, sin tarjeta. El glosario, las notas y el progreso ' +
      'ya funcionan sin ella.',
    'notice.setup.cta': 'Conseguir una clave gratis',
    'notice.nostmt.title': 'No se encontró el enunciado',
    'notice.nostmt.body': 'Ladder no pudo leer ningún problema en esta página. Si ' +
      'todavía está cargando, pulsa recargar en la cabecera. Si no, pega el ' +
      'enunciado en el cuadro de abajo y pregunta igual.',
    'notice.error.title': 'La petición no salió',
    'notice.error.cta': 'Abrir ajustes',

    /* ------------------------------------------------------------- learn */
    'learn.found': 'Palabras que este problema da por sabidas',
    'learn.fallback': 'Glosario para empezar',
    'learn.foundNote.one': '1 término encontrado en el enunciado. Explicado en ' +
      'palabras claras, sin necesidad de clave.',
    'learn.foundNote.other': '{n} términos encontrados en el enunciado. Explicados ' +
      'en palabras claras, sin necesidad de clave.',
    'learn.fallbackNote': 'No hubo coincidencias en esta página, así que aquí están ' +
      'los términos más habituales. Funcionan sin clave de API.',
    'learn.explain': 'Explicarlo con este problema',
    'learn.deeper': 'Profundizar',
    'learn.concepts': '¿Qué conceptos hacen falta aquí?',
    'learn.beginnerOn': 'Activar el modo principiante',
    'learn.beginnerOff': 'Desactivar el modo principiante',

    /* -------------------------------------------------------------- code */
    'code.yourCode': 'Tu código',
    'code.grabbed': 'tomado del editor: comprueba que esté completo',
    'code.notGrabbed': 'pégalo aquí, no se pudo leer el editor de este sitio',
    'code.placeholder': 'Pega aquí tu intento...',
    'code.errLabel': 'Error o caso de prueba que falla',
    'code.optional': 'opcional',
    'code.errPlaceholder': 'Pega el mensaje de error, o la entrada que da el ' +
      'resultado incorrecto...',
    'code.review': 'Revisarlo (sin spoilers)',
    'code.debug': '¿Por qué falla?',
    'code.optimize': 'Hacerlo más rápido',
    'code.dryrun': 'Seguirlo paso a paso',
    'code.mark': 'Marcar este problema',
    'code.solved': 'Lo resolví',
    'code.solvedDone': 'Resuelto ✓',
    'code.stuck': 'Estoy atascado, volver más tarde',

    /* ------------------------------------------------------------- notes */
    'notes.title': 'Notas sobre este problema',
    'notes.note': 'Escribe la idea clave con tus palabras. Eso es lo que se ' +
      'traslada al siguiente problema. Se guarda solo, y se queda en este equipo.',
    'notes.placeholder': '¿Qué me hizo entenderlo?\n¿Qué buscaría la próxima vez?\n' +
      '¿En qué me equivoqué primero?',
    'notes.summarize': 'Resumir la conversación en notas',
    'notes.summarizePrompt': 'Escribe tres o cuatro puntos para guardar en mis ' +
      'notas sobre este problema: la idea clave, a qué patrón pertenece y el error ' +
      'que evitar la próxima vez. Que se pueda releer en diez segundos.',

    /* ---------------------------------------------------------- progress */
    'progress.streak': 'días seguidos',
    'progress.solved': 'resueltos',
    'progress.seen': 'problemas vistos',
    'progress.hints': 'pistas usadas',
    'progress.due': 'Toca repasar',
    'progress.dueEmpty': 'Nada pendiente. Marca un problema como resuelto y Ladder ' +
      'te lo devolverá al día siguiente, luego a los tres días, luego a la semana.',
    'progress.recent': 'Recientes',
    'progress.recentEmpty': 'Todavía no hay problemas registrados.',
    'progress.loading': 'Cargando...',
    'progress.hintN': 'pista {n}',
    'badge.solved': 'resuelto',
    'badge.review': 'repasar',

    /* ------------------------------------------------------------ toasts */
    'toast.theme': 'Tema: {mode}',
    'theme.auto': 'seguir el sistema',
    'theme.light': 'claro',
    'theme.dark': 'oscuro',
    'toast.docked': 'Anclado junto a la página',
    'toast.floating': 'Flotando sobre la página',
    'toast.codeLang': 'Los ejemplos usarán {lang}',
    'toast.reread': 'Problema releído desde la página',
    'toast.rereadFail': 'No se encontró ningún enunciado en esta página',
    'toast.busy': 'Todavía estoy escribiendo la respuesta anterior...',
    'toast.needCode': 'Pega primero tu código',
    'toast.solvedMark': 'Marcado como resuelto. Repaso programado para {when}.',
    'toast.stuckMark': 'Añadido a la lista de repaso de mañana.',
    'toast.beginnerOn': 'Modo principiante activado: se define cada término',
    'toast.beginnerOff': 'Modo principiante desactivado: respuestas más breves y técnicas',

    'confirm.skip.one': 'Vas a saltarte 1 peldaño y pasar directo a «{label}».\n\n' +
      'Con pistas más pequeñas suele bastar. ¿Saltar de todos modos?',
    'confirm.skip.other': 'Vas a saltarte {n} peldaños y pasar directo a «{label}».' +
      '\n\nCon pistas más pequeñas suele bastar. ¿Saltar de todos modos?',

    /* -------------------------------------------------------------- asks */
    'ask.review': 'Revisa mi código',
    'ask.debug': '¿Por qué falla?',
    'ask.optimize': 'Hazlo más rápido',
    'ask.dryrun': 'Sígelo paso a paso',
    'ask.concepts': '¿Qué necesito aprender primero?',
    'ask.testcases': 'Casos límite que probar',
    'ask.glossary': 'Explica «{term}» en el contexto de este problema.',
    'ask.fallback': 'Ayúdame con esto',

    /* -------------------------------------------------------------- time */
    'time.never': 'nunca',
    'time.today': 'hoy',
    'time.tomorrow': 'mañana',
    'time.yesterday': 'ayer',
    'time.inDays': 'dentro de {n} días',
    'time.agoDays': 'hace {n} días',

    /* ------------------------------------------------------------- popup */
    'popup.noProvider': 'sin clave todavía: abre los ajustes abajo',
    'popup.open': 'Abrir el panel',
    'popup.hint': 'Siguiente pista',
    'popup.notProblem': 'Esta página no es un problema conocido',
    'popup.notProblemBody': 'Abre el panel igualmente y pega un problema.',
    'popup.openProblem': 'Abre un problema en LeetCode, Codeforces, AtCoder u otros.',
    'popup.noStatement': 'No se detectó ningún enunciado en esta página',
    'popup.noHints': 'sin pistas usadas',
    'popup.hintLevel': 'pista {n} de 5',
    'popup.streak': 'racha',
    'popup.solved': 'resueltos',
    'popup.seen': 'vistos',
    'popup.due': 'Toca repasar',
    'popup.settings': 'Ajustes y claves de API',

    /* ----------------------------------------------------------- options */
    'opt.title': 'Ajustes de Ladder',
    'opt.tagline': 'Pistas graduales para LeetCode, Codeforces y similares.',
    'opt.status.none': 'Todavía sin proveedor',
    'opt.status.using': 'Usando {provider} · {model}',

    'opt.start.title': 'Empieza aquí: una clave gratis en un minuto',
    'opt.start.title2': 'Añade otra clave o cambia la que usas',
    'opt.step1.title': 'Abre Google AI Studio',
    'opt.step1.body': 'Inicia sesión con cualquier cuenta de Google. Sin tarjeta y ' +
      'sin configurar facturación.',
    'opt.step1.cta': 'Conseguir una clave de Gemini gratis',
    'opt.step2.title': 'Pulsa «Create API key» y cópiala',
    'opt.step2.body': 'Se parece a <code>AIzaSy…</code>: una cadena larga de letras ' +
      'y números.',
    'opt.step3.title': 'Pégala aquí abajo',
    'opt.step3.body': 'Ladder deduce por sí solo a qué proveedor pertenece.',
    'opt.paste.placeholder': 'Pega aquí cualquier clave de API',
    'opt.paste.save': 'Guardar clave',
    'opt.paste.hint': 'Acepta claves de Gemini, OpenAI, Anthropic, OpenRouter, ' +
      'Groq, DeepSeek, Mistral, xAI, Together y Cerebras.',
    'opt.paste.detected': 'Parece una clave de {provider}.',
    'opt.paste.unknownType': 'Ladder no reconoce este formato. Guárdala en el ' +
      'proveedor correspondiente más abajo.',
    'opt.paste.unknownSave': 'Ladder no puede deducir a qué proveedor pertenece ' +
      'esta clave. Pégala en el cuadro de ese proveedor, más abajo.',
    'opt.paste.savedTesting': 'Guardada y activada como proveedor: {provider}. ' +
      'Probándola...',
    'opt.paste.savedOk': 'Guardada y funcionando. Abre un problema y pulsa Ctrl+Shift+L.',
    'opt.paste.savedFail': 'Guardada, pero la prueba falló: {error}',

    'opt.providers': 'Proveedores',
    'opt.providers.note': 'Añade los que quieras y cambia entre ellos. Las claves ' +
      'se guardan solo en este navegador y no se envían a ningún sitio salvo al ' +
      'proveedor que elijas.',
    'opt.prov.use': 'Usar este',
    'opt.prov.inUse': 'En uso',
    'opt.prov.show': 'Mostrar',
    'opt.prov.hide': 'Ocultar',
    'opt.prov.save': 'Guardar',
    'opt.prov.test': 'Probar',
    'opt.prov.model': 'Modelo',
    'opt.prov.getKey': 'Conseguir una clave →',
    'opt.prov.install': 'Instalarlo →',
    'opt.prov.free': 'Plan gratuito',
    'opt.prov.local': 'Local',
    'opt.prov.keyPlaceholder': 'Clave de API',
    'opt.prov.basePlaceholder': 'URL base, por ejemplo https://mi-host/v1',
    'opt.prov.modelPlaceholder': 'nombre del modelo',
    'opt.res.saved': 'Guardada',
    'opt.res.removed': 'Clave eliminada',
    'opt.res.needKey': 'Añade primero una clave',
    'opt.res.testing': 'Probando...',
    'opt.res.working': 'Funciona',
    'opt.res.workingN': 'Funciona · {n} modelos',
    'opt.res.failed': 'Falló',
    'opt.res.permOk': 'Permiso concedido para {origin}',
    'opt.res.permNo': 'Ladder necesita permiso para {origin} para poder conectarse',

    'opt.coach': 'Cómo te acompaña Ladder',
    'opt.beginner.title': 'Modo principiante',
    'opt.beginner.body': 'Da por hecho que no tienes formación en informática. Se ' +
      'define cada término y se explica cada complejidad en palabras claras. ' +
      'Desactívalo cuando la jerga deje de frenarte.',
    'opt.spoiler.title': 'Difuminar las soluciones completas hasta hacer clic',
    'opt.spoiler.body': 'Evita que se te vaya el ojo a la respuesta al desplazarte.',
    'opt.autoOpen.title': 'Abrir solo en las páginas de problemas',
    'opt.autoOpen.body': 'Desactivado por defecto, para que el panel aparezca solo ' +
      'cuando lo quieras.',
    'opt.sendCode.title': 'Incluir mi código en las peticiones',
    'opt.sendCode.body': 'Permite que Ladder revise lo que has escrito. Desactívalo ' +
      'para enviar solo el enunciado.',
    'opt.uiLang.title': 'Idioma de Ladder',
    'opt.uiLang.body': 'Cambia el panel, esta página y el idioma en el que llegan ' +
      'las respuestas.',
    'opt.lang.title': 'Lenguaje de los ejemplos de código',
    'opt.theme.title': 'Tema del panel',
    'opt.theme.auto': 'Seguir el sistema',
    'opt.theme.light': 'Claro',
    'opt.theme.dark': 'Oscuro',
    'opt.style.title': 'Estilo de las respuestas',
    'opt.style.body': 'Más bajo es más predecible; más alto, más variado.',

    'opt.keyboard': 'Teclado',
    'opt.keyboard.note': 'Se cambian en <code>chrome://extensions/shortcuts</code>.',
    'opt.kb.toggle': 'Mostrar u ocultar el panel',
    'opt.kb.hint': 'Pedir la siguiente pista',
    'opt.kb.send': 'Enviar una pregunta',
    'opt.kb.newline': 'Salto de línea en una pregunta',
    'opt.kb.close': 'Cerrar el panel',

    'opt.data': 'Tus datos',
    'opt.data.note': 'Todo lo que Ladder sabe vive en este perfil del navegador. No ' +
      'se sube nada a ningún sitio y no hay cuenta.',
    'opt.data.export': 'Exportar progreso',
    'opt.data.import': 'Importar progreso',
    'opt.data.clear': 'Borrarlo todo',
    'opt.data.exported': 'Exportado. Las claves de API se dejan fuera del archivo a ' +
      'propósito.',
    'opt.data.imported': 'Se importaron {n} problemas.',
    'opt.data.importFail': 'No se pudo importar: {error}',
    'opt.data.notLadder': 'Este archivo no es una exportación de Ladder.',
    'opt.data.confirmClear': '¿Borrar todos los datos de Ladder en este navegador?' +
      '\n\nEsto elimina las claves de API, las notas, el progreso y el calendario ' +
      'de repaso. No se puede deshacer.',
    'opt.data.cleared': 'Todo borrado.',
    'opt.foot': 'Ladder es una herramienta de estudio. Si estás preparando una ' +
      'entrevista, la escalera de pistas solo ayuda si la subes despacio: cada ' +
      'peldaño que te saltas es una repetición que no hiciste.',

    /* --------------------------------------------------------- providers */
    'prov.gemini.tagline': 'Plan gratuito, sin tarjeta. El mejor sitio para empezar.',
    'prov.gemini.keyHint': 'Empieza por AIza...',
    'prov.groq.tagline': 'Plan gratuito, las respuestas llegan casi al instante.',
    'prov.groq.keyHint': 'Empieza por gsk_...',
    'prov.openrouter.tagline': 'Una clave, muchos modelos. Varios son gratuitos.',
    'prov.openrouter.keyHint': 'Empieza por sk-or-v1-...',
    'prov.cerebras.tagline': 'Plan gratuito, muy rápido.',
    'prov.cerebras.keyHint': 'Empieza por csk-...',
    'prov.mistral.tagline': 'Plan gratuito en La Plateforme.',
    'prov.mistral.keyHint': 'Una clave de 32 caracteres',
    'prov.openai.tagline': 'De pago. Requiere facturación en la cuenta.',
    'prov.openai.keyHint': 'Empieza por sk-...',
    'prov.anthropic.tagline': 'De pago. Explica muy bien paso a paso.',
    'prov.anthropic.keyHint': 'Empieza por sk-ant-...',
    'prov.deepseek.tagline': 'Barato y sólido en algoritmos.',
    'prov.deepseek.keyHint': 'Empieza por sk-...',
    'prov.xai.tagline': 'De pago.',
    'prov.xai.keyHint': 'Empieza por xai-...',
    'prov.together.tagline': 'Modelos de pesos abiertos, se paga por uso.',
    'prov.together.keyHint': 'Una clave hexadecimal de 64 caracteres',
    'prov.ollama.tagline': 'Se ejecuta en local. Sin clave, sin coste y sin conexión.',
    'prov.ollama.keyHint': 'No hace falta clave. Arráncalo con: OLLAMA_ORIGINS=* ollama serve',
    'prov.custom.tagline': 'Cualquier endpoint que hable /chat/completions.',
    'prov.custom.keyHint': 'La URL base y el modelo los pones tú',

    /* ------------------------------------------------------------ errors */
    'err.noProvider': 'Todavía no hay ningún proveedor configurado. Abre los ajustes ' +
      'de Ladder para añadir una clave: Google Gemini tiene plan gratuito y se ' +
      'tarda alrededor de un minuto.',
    'err.unknownProvider': 'Proveedor desconocido: {id}',
    'err.noKey': 'No hay ninguna clave guardada para {provider}. Añade una en los ' +
      'ajustes de Ladder.',
    'err.rejected': 'Esa clave de API fue rechazada (HTTP {status}). Abre los ' +
      'ajustes de Ladder y revisa la clave de {provider}. {detail}',
    'err.rate': 'Límite de peticiones alcanzado (HTTP 429). Los planes gratuitos ' +
      'limitan las peticiones por minuto: espera un momento e inténtalo otra vez, o ' +
      'cambia de proveedor en los ajustes. {detail}',
    'err.model404': 'No se encontró el modelo (HTTP 404). El nombre del modelo en ' +
      'los ajustes puede estar mal o no estar disponible en tu plan. {detail}',
    'err.bad400': 'El proveedor rechazó la petición (HTTP 400). {detail}',
    'err.server5xx': 'El proveedor tuvo un error de servidor (HTTP {status}). Suele ' +
      'ser temporal. {detail}',
    'err.generic': 'La petición falló (HTTP {status}). {detail}',
    'err.emptyBody': 'El proveedor devolvió una respuesta vacía.',
    'err.blank': 'El modelo no devolvió nada. Normalmente significa que saltó un ' +
      'filtro de seguridad o que el nombre del modelo está mal. Prueba con otro ' +
      'modelo en los ajustes.',
    'err.netLocal': 'No se pudo conectar con {provider}. ¿Está en marcha? Los ' +
      'servidores locales hay que arrancarlos con OLLAMA_ORIGINS=* para que la ' +
      'extensión pueda conectarse.',
    'err.net': 'No se pudo conectar con el proveedor. Revisa tu conexión y, si usas ' +
      'un endpoint propio, que Ladder tenga permiso para ese host.',
    'err.probeLocal': 'No se pudo conectar con ese endpoint. Comprueba que el ' +
      'servidor está en marcha y que acepta peticiones de extensiones del navegador ' +
      '(para Ollama: OLLAMA_ORIGINS=*).',
    'err.probeNet': 'No se pudo conectar con el proveedor: {detail}',
    'err.noEndpoint': 'Este proveedor no tiene ningún endpoint configurado.',
    'err.noModel': 'Este proveedor no tiene ningún modelo configurado.',
    'err.stoppedBy': '\n\n_(detenido: {reason})_',

    /* ---------------------------------------------------------- glossary */
    'g.array.def': 'Array: una fila numerada de casillas con valores, una junto a otra.',
    'g.array.why': 'La primera casilla es la 0, no la 1. Casi todos los errores de ' +
      'desfase por uno empiezan aquí.',
    'g.index.def': 'Índice: el número de posición de un elemento dentro de un array.',
    'g.index.why': 'Lee bien el enunciado: unos sitios cuentan desde 0 y otros desde 1.',
    'g.subarray.def': 'Subarray: un tramo de elementos vecinos de un array, sin huecos.',
    'g.subarray.why': 'Distinto de una subsecuencia: los subarrays tienen que ir seguidos.',
    'g.subsequence.def': 'Subsecuencia: elementos tomados en orden, pero pudiendo saltar.',
    'g.subsequence.why': 'De [1,2,3], la subsecuencia [1,3] vale; el subarray [1,3] no.',
    'g.substring.def': 'Subcadena: un tramo de caracteres seguidos dentro de una cadena.',
    'g.substring.why': 'La misma idea que un subarray, pero con texto.',
    'g.permutation.def': 'Permutación: los mismos elementos colocados en otro orden.',
    'g.permutation.why': 'n elementos tienen n factorial ordenaciones, y eso crece de ' +
      'forma aterradora.',
    'g.hash-map.def': 'Hash map: una tabla de consulta; le das un nombre y te devuelve ' +
      'el valor al instante.',
    'g.hash-map.why': 'Convierte «recorrer toda la lista buscando x» en una sola pregunta.',
    'g.set.def': 'Conjunto: una bolsa que guarda cada valor una sola vez y responde al ' +
      'momento «¿está x aquí?».',
    'g.set.why': 'La herramienta estándar para detectar duplicados.',
    'g.stack.def': 'Pila: un montón en el que solo se añade y se quita por arriba.',
    'g.stack.why': 'Buena para todo lo que anida: paréntesis, deshacer, backtracking.',
    'g.queue.def': 'Cola: una fila en la que entras por detrás y sales por delante.',
    'g.queue.why': 'Es el motor que hay dentro de la búsqueda en anchura.',
    'g.linked-list.def': 'Lista enlazada: una cadena de casillas donde cada una guarda ' +
      'además una flecha a la siguiente.',
    'g.linked-list.why': 'No puedes saltar al medio: hay que recorrerla desde la cabeza.',
    'g.tree.def': 'Árbol: una estructura que se ramifica hacia abajo desde una única ' +
      'raíz, sin ciclos.',
    'g.tree.why': 'Casi todos los problemas de árboles se resuelven haciendo lo mismo ' +
      'con cada hijo.',
    'g.binary-search-tree.def': 'Árbol binario de búsqueda: un árbol ordenado, con los ' +
      'valores menores a la izquierda y los mayores a la derecha.',
    'g.binary-search-tree.why': 'Recorrerlo en orden te da los valores ya ordenados.',
    'g.graph.def': 'Grafo: puntos unidos por líneas. Los puntos son nodos; las líneas, aristas.',
    'g.graph.why': 'Carreteras entre ciudades, amistades, dependencias: todo son grafos.',
    'g.heap.def': 'Heap: un contenedor que siempre te entrega el elemento más pequeño ' +
      '(o más grande) primero.',
    'g.heap.why': 'Úsalo cuando necesites sacar repetidamente el mejor de un conjunto ' +
      'que va cambiando.',
    'g.recursion.def': 'Recursión: una función que se llama a sí misma con una versión ' +
      'más pequeña del mismo problema.',
    'g.recursion.why': 'Necesita un caso base; si no, no para nunca y revienta con un ' +
      'desbordamiento de pila.',
    'g.memoization.def': 'Memoización: apuntar las respuestas ya calculadas para no ' +
      'repetirlas nunca.',
    'g.memoization.why': 'Suele ser la diferencia entre tardar segundos y tardar años.',
    'g.dynamic-programming.def': 'Programación dinámica: resolver primero las piezas ' +
      'pequeñas y construir con ellas las respuestas grandes.',
    'g.dynamic-programming.why': 'Se reconoce cuando el mismo subproblema reaparece una y otra vez.',
    'g.greedy.def': 'Voraz: quedarte siempre con la opción que mejor pinta ahora mismo, ' +
      'sin reconsiderar.',
    'g.greedy.why': 'Rápido cuando funciona y silenciosamente incorrecto cuando no. Hay ' +
      'que demostrarlo.',
    'g.two-pointers.def': 'Dos punteros: dos marcas que recorren los datos, normalmente ' +
      'desde los extremos.',
    'g.two-pointers.why': 'Convierte un doble bucle anidado en una sola pasada.',
    'g.sliding-window.def': 'Ventana deslizante: un tramo del array que crece por delante ' +
      'y se encoge por detrás.',
    'g.sliding-window.why': 'La opción para «el mejor tramo de longitud k» o «el tramo ' +
      'más corto que cumple X».',
    'g.binary-search.def': 'Búsqueda binaria: partir el rango por la mitad en cada paso ' +
      'haciendo una pregunta de sí o no.',
    'g.binary-search.why': 'Necesita datos ordenados, o una propiedad de sí/no que cambie ' +
      'exactamente una vez.',
    'g.prefix-sum.def': 'Suma de prefijos: un total acumulado precalculado, para que ' +
      'cualquier suma de un rango sea una resta.',
    'g.prefix-sum.why': 'Se calcula una vez y luego responde miles de consultas al instante.',
    'g.bfs.def': 'BFS: recorrer un grafo por niveles, empezando por lo más cercano.',
    'g.bfs.why': 'Da el camino más corto cuando todos los pasos cuestan lo mismo.',
    'g.dfs.def': 'DFS: recorrer un grafo yendo lo más hondo posible antes de volver atrás.',
    'g.dfs.why': 'Sale natural escribirlo con recursión; vigila la profundidad con ' +
      'entradas grandes.',
    'g.backtracking.def': 'Backtracking: probar una opción, explorarla, deshacerla y ' +
      'probar la siguiente.',
    'g.backtracking.why': 'El patrón que hay detrás del sudoku, las n reinas y generar ' +
      'combinaciones.',
    'g.time-complexity.def': 'Complejidad temporal: una cuenta aproximada de cómo crece ' +
      'el trabajo cuando crece la entrada.',
    'g.time-complexity.why': 'O(n) significa que doblar la entrada dobla más o menos el trabajo.',
    'g.space-complexity.def': 'Complejidad espacial: cuánta memoria extra usas además de ' +
      'la propia entrada.',
    'g.space-complexity.why': 'A veces es la restricción de verdad, sobre todo en sitios ' +
      'de competición.',
    'g.constraints.def': 'Restricciones: los límites de tamaño y de valores de la entrada, ' +
      'listados en el enunciado.',
    'g.constraints.why': 'Léelas primero. Te dicen qué enfoques son lo bastante rápidos.',
    'g.modulo.def': 'Módulo: el resto de una división. 7 módulo 3 es 1.',
    'g.modulo.why': 'Los problemas piden la respuesta módulo 1000000007 para que los ' +
      'números no se desborden.',
    'g.overflow.def': 'Desbordamiento: un número que se hace demasiado grande para su ' +
      'tipo y da la vuelta hasta convertirse en un disparate.',
    'g.overflow.why': 'En C++ y Java usa un tipo de 64 bits. Python no tiene límite, así ' +
      'que ahí nunca te pasa.',
    'g.in-place.def': 'In situ: modificar la entrada directamente en vez de crear una copia.',
    'g.in-place.why': 'Suele pedirse para obligarte a usar O(1) de espacio extra.',
    'g.stable-sort.def': 'Ordenación estable: la que mantiene el orden relativo original ' +
      'entre elementos iguales.',
    'g.stable-sort.why': 'Importa cuando ordenas por un campo y quieres que los empates ' +
      'los resuelva una ordenación anterior.',
    'g.adjacency-list.def': 'Lista de adyacencia: cómo se guarda un grafo, anotando para ' +
      'cada nodo los nodos con los que conecta.',
    'g.adjacency-list.why': 'La lista ocupa poco; la matriz es una cuadrícula entera de sí o no.',
    'g.union-find.def': 'Union-find: una estructura que sigue qué elementos están en el ' +
      'mismo grupo y fusiona grupos muy rápido.',
    'g.union-find.why': 'La herramienta estándar para «¿están estos dos conectados?».',
    'g.trie.def': 'Trie: un árbol de caracteres en el que las palabras con el mismo ' +
      'prefijo comparten camino.',
    'g.trie.why': 'El autocompletado, hecho estructura de datos.',
    'g.bitmask.def': 'Máscara de bits: usar los dígitos binarios de un número como una ' +
      'fila de interruptores.',
    'g.bitmask.why': 'Permite representar un subconjunto de hasta unos 20 elementos con ' +
      'un solo entero.',
    'g.sentinel.def': 'Centinela: un elemento falso puesto en el borde para no tener que ' +
      'tratarlo como caso especial.',
    'g.sentinel.why': 'Quita casi todo el dolor de comprobar nulos en problemas de listas ' +
      'enlazadas.',
    'g.edge-case.def': 'Caso límite: una entrada en el borde de lo permitido: vacía, de un ' +
      'solo elemento, todos iguales, del tamaño máximo.',
    'g.edge-case.why': 'Ahí mueren la mayoría de los envíos fallidos, no en la lógica principal.',
    'g.tle.def': 'TLE: tu código es correcto pero demasiado lento para el límite de tiempo.',
    'g.tle.why': 'No depures la lógica. Reduce la complejidad.',
    'g.mle.def': 'MLE: tu código usó más memoria de la permitida.',
    'g.mle.why': 'Suele ser un array dimensionado con la cota equivocada, o guardar lo ' +
      'que podrías recalcular.',
    'g.wa.def': 'WA: tu salida no coincidió con la esperada.',
    'g.wa.why': 'Busca la entrada más pequeña que lo reproduzca antes de tocar nada.',
    'g.rte.def': 'RTE: tu programa se rompió durante la ejecución.',
    'g.rte.why': 'Casi siempre un índice fuera de rango, una división por cero o ' +
      'demasiada recursión.',
    'g.stdin.def': 'Entrada estándar: cómo los sitios de competición te pasan la entrada ' +
      'y leen tu respuesta.',
    'g.stdin.why': 'Codeforces lee de la entrada estándar; LeetCode te pasa un argumento ' +
      'de función.',
    'g.lexicographic.def': 'Orden lexicográfico: orden de diccionario, comparando carácter ' +
      'a carácter desde la izquierda.',
    'g.lexicographic.why': '«apple» va antes que «banana», y «Z» antes que «a» en ASCII.',
    'g.gcd.def': 'MCD: el número más grande que divide a otros dos de forma exacta.',
    'g.gcd.why': 'Se calcula al instante con el algoritmo de Euclides.',
    'g.prime.def': 'Primo: un número divisible solo por 1 y por sí mismo.',
    'g.prime.why': 'Para encontrar todos los primos hasta n usa una criba, no una prueba ' +
      'de divisibilidad por número.',
    'g.monotonic.def': 'Monótono: que va siempre en una sola dirección, sin decrecer nunca ' +
      'o sin crecer nunca.',
    'g.monotonic.why': 'Una pila monótona resuelve «el siguiente elemento mayor» en una pasada.',
    'g.invariant.def': 'Invariante: algo que se mantiene cierto en cada vuelta del bucle.',
    'g.invariant.why': 'Decirlo en voz alta es la forma más rápida de encontrar el fallo ' +
      'de un bucle.'
  };
})(typeof globalThis !== 'undefined' ? globalThis : self);

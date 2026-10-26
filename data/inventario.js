/* VÉRTICE / SMA · Datos semilla del demo
 * Estructura pensada para mapear 1:1 a las tablas de docs/esquema.sql.
 * Todo es ficticio: inmuebles, personas, teléfonos y correos.
 * Las fotos son de Unsplash (uso demo). Reemplazar por almacenamiento propio en producción.
 */
const U = (id, w = 1400) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

window.VERTICE_DATA = {
  config: {
    marca: 'VÉRTICE / SMA',
    tipoCambio: 20, // MXN por USD, referencial
    whatsapp: '524155550130',
    email: 'contacto@vertice-sma.mx',
    version: 2
  },

  zonas: {
    'sma-centro': 'Centro Histórico SMA',
    'cruz-palmar': 'Cruz del Palmar',
    'atotonilco': 'Atotonilco / Dolores',
    'corredor-industrial': 'Corredor Industrial 57'
  },

  asesores: ['Arq. Claudia Ramos', 'Lic. Roberto Valenzuela', 'Ing. Marco Aurelio Soto'],

  inventario: [
    {
      id: 'SMA-T1043', ref: 'SMA-T1043', categoria: 'terreno', zona: 'cruz-palmar', estatus: 'publicado', destacado: true,
      titulo: 'Lote Campestre Los Cardones',
      ubicacion: 'Comunidad El Capadero, San Miguel de Allende',
      lat: 20.9142, lng: -100.8521,
      precioMxn: 550000, superficieM2: 1043.7, construccionM2: 0,
      geometria: 'Frente 25.5 m · Fondo 40.9 m',
      normativa: 'COS 0.40 · Desplante 100% libre',
      asoleamiento: 'Sur-Poniente', horasSol: 6.5,
      topografia: 'Pendiente regular +4%', suelo: 'Tepetate y cantera, suelo firme',
      usoSuelo: 'H1 Campestre', densidad: 'Residencial campestre, baja densidad',
      estatusLegal: 'Escriturado', gravamen: 'Libre de gravamen',
      tiempoAcceso: '20 min al Centro', vialidad: 'Camino empedrado campestre',
      luz: 'Red CFE a 35 m del lindero', agua: 'Factibilidad de pozo comunal y aljibe pluvial',
      plusvaliaZonaPct: 44, etiqueta: 'Oportunidad de entrada',
      descripcion: 'Lote de 1,043.70 m² en Cruz del Palmar, a 20 minutos del centro de San Miguel. Entorno campirano con mezquites, servicio de luz cercano y una zona en maduración. Pensado para una casa pasiva de fin de semana con captación pluvial y muros de piedra local.',
      dictamen: 'El frente al sur permite captar sol en invierno. Proteger el poniente con muro de piedra y vegetación reduce la ganancia térmica de la tarde.',
      fotos: [
        { url: U('1500382017468-9049fed747ef'), alt: 'Lote campestre con pastizal y mezquites al atardecer' },
        { url: U('1500530855697-b586d89ba3ee'), alt: 'Vista abierta del valle desde el predio' },
        { url: U('1472214103451-9374bd1c798e'), alt: 'Camino rural de acceso al terreno' },
        { url: U('1470071459604-3b5ec3a7fe05'), alt: 'Bruma matutina sobre la vegetación del entorno' }
      ],
      creadoEn: '2026-08-14'
    },
    {
      id: 'SMA-C380', ref: 'SMA-C380', categoria: 'casa', zona: 'sma-centro', estatus: 'publicado', destacado: false,
      titulo: 'Villa La Cantera y Patio Central',
      ubicacion: 'Centro Histórico, San Miguel de Allende',
      lat: 20.9144, lng: -100.7452,
      precioMxn: 16500000, superficieM2: 420, construccionM2: 380,
      geometria: 'Finca de esquina patrimonial',
      normativa: '2 niveles · Patio central con arquería',
      asoleamiento: 'Oriente-Poniente', horasSol: 5.5,
      topografia: 'Plano urbano', suelo: 'Cimentación de mampostería volcánica',
      usoSuelo: 'Patrimonial Centro', densidad: 'Zona de Monumentos (INAH)',
      estatusLegal: 'Escritura y dictamen INAH', gravamen: 'Inscripción definitiva en RPP',
      tiempoAcceso: 'A pie de la Parroquia', vialidad: 'Calle empedrada tradicional',
      luz: 'Acometida CFE subterránea', agua: 'Toma municipal SAPASMA activa',
      plusvaliaZonaPct: 28, etiqueta: 'Pieza de autor',
      descripcion: 'Residencia colonial-contemporánea restaurada. Viguería de demolición a 4.2 m, cantera rosa pulida en la arquería y patio central con fuente de piedra volcánica. Tres recámaras principales, cava subterránea climatizada y terraza mirador hacia la Parroquia.',
      dictamen: 'Los muros de 60 cm amortiguan la oscilación térmica del día. La ventilación cruzada por los vanos tradicionales evita climatización en casi todo el año.',
      fotos: [
        { url: U('1600585154340-be6161a56a0c'), alt: 'Fachada de la villa con patio y arquería' },
        { url: U('1600596542815-ffad4c1539a9'), alt: 'Patio central con alberca y corredor techado' },
        { url: U('1600566753376-12c8ab7fb75b'), alt: 'Sala con viguería de madera y ventanales' },
        { url: U('1600585154526-990dced4db0d'), alt: 'Recámara principal con luz natural' }
      ],
      creadoEn: '2026-07-22'
    },
    {
      id: 'SMA-B1200', ref: 'SMA-B1200', categoria: 'bodega', zona: 'corredor-industrial', estatus: 'publicado', destacado: false,
      titulo: 'Bodega Logística Bajío',
      ubicacion: 'Salida a Querétaro, Corredor Industrial 57',
      lat: 20.8806, lng: -100.7301,
      precioMxn: 7200000, superficieM2: 1850, construccionM2: 1200,
      geometria: 'Frente carretero 45 m · Fondo 41 m',
      normativa: 'Claro libre 8.5 m · Rampa para tráiler de 53 pies',
      asoleamiento: 'Norte', horasSol: 0,
      topografia: 'Plano industrial', suelo: 'Losa MR42, 250 kg/cm² con fibra metálica',
      usoSuelo: 'Mixto / Bodega', densidad: 'Comercial y logístico ligero',
      estatusLegal: 'Uso de suelo factible', gravamen: 'Dictamen de impacto vial y ambiental en trámite',
      tiempoAcceso: '12 min a la salida a Querétaro', vialidad: 'Acceso directo al libramiento',
      luz: 'Subestación de 45 kVA', agua: 'Cisterna industrial de 20,000 L y red',
      plusvaliaZonaPct: 35, etiqueta: 'Rendimiento comercial',
      descripcion: 'Estructura de acero con claros libres de 8.5 m, piso de concreto de alta resistencia con fibra metálica, rampa niveladora para tráiler de 53 pies y área corporativa de dos niveles con estacionamiento para 12 vehículos.',
      dictamen: 'La orientación norte da luz difusa cenital sin carga solar directa. Buen candidato para centro de distribución boutique, vinícola artesanal o taller de gran formato.',
      fotos: [
        { url: U('1586528116311-ad8dd3c8310d'), alt: 'Nave industrial con andenes de carga' },
        { url: U('1553413077-190dd305871c'), alt: 'Interior de la bodega con racks' },
        { url: U('1565793298595-6a879b1d9492'), alt: 'Pasillo central de la nave' },
        { url: U('1504307651254-35680f356dfd'), alt: 'Estructura metálica y cubierta' }
      ],
      creadoEn: '2026-06-30'
    },
    {
      id: 'SMA-R25000', ref: 'SMA-R25000', categoria: 'rancho', zona: 'atotonilco', estatus: 'publicado', destacado: false,
      titulo: 'Finca El Peregrino y Olivos',
      ubicacion: 'Corredor Atotonilco - Dolores Hidalgo',
      lat: 20.8812, lng: -100.7704,
      precioMxn: 18000000, superficieM2: 25000, construccionM2: 220,
      geometria: 'Polígono con 180 m de frente',
      normativa: 'Casa de campo + 120 olivos jóvenes',
      asoleamiento: '360° despejado', horasSol: 8,
      topografia: 'Loma suave ondulada', suelo: 'Franco-arcilloso con buen drenaje',
      usoSuelo: 'Agroturismo / Viñedo', densidad: 'Agrícola y campestre exclusivo',
      estatusLegal: 'Título y pozo registrado', gravamen: 'Concesión CONAGUA transferible',
      tiempoAcceso: '18 min al corredor Atotonilco', vialidad: 'Camino rural pavimentado',
      luz: 'Transformador propio CFE bifásico', agua: 'Pozo profundo con concesión registrada',
      plusvaliaZonaPct: 50, etiqueta: 'Agroturismo y viñedo',
      descripcion: 'Dos hectáreas y media con concesión de pozo registrada, plantación de 120 olivos jóvenes y suelo franco apto para viñedo boutique. Incluye casa de campo estilo hacienda con porche perimetral y tejas de barro cocido.',
      dictamen: 'Hay espacio para cuatro cabañas boutique sin tocar la plantación, o para dejarlo como finca privada de descanso.',
      fotos: [
        { url: U('1500076656116-558758c991c1'), alt: 'Campo abierto de la finca al amanecer' },
        { url: U('1506377247377-2a5b3b417ebb'), alt: 'Hileras de viñedo' },
        { url: U('1474722883778-792e7990302f'), alt: 'Viñedo con luz de atardecer' },
        { url: U('1564013799919-ab600027ffc6'), alt: 'Casa de campo con porche' }
      ],
      creadoEn: '2026-05-18'
    },
    {
      id: 'SMA-T2100', ref: 'SMA-T2100', categoria: 'terreno', zona: 'atotonilco', estatus: 'publicado', destacado: false,
      titulo: 'Lote Mirador Aguas Termales',
      ubicacion: 'Zona Balnearios y Santuario, Atotonilco',
      lat: 20.8725, lng: -100.7602,
      precioMxn: 1250000, superficieM2: 2100, construccionM2: 0,
      geometria: 'Frente 35 m · Fondo 60 m',
      normativa: 'COS 0.35 · Desplante libre',
      asoleamiento: 'Sur', horasSol: 6.8,
      topografia: 'Terraza escalonada', suelo: 'Roca y piedra braza natural',
      usoSuelo: 'Campestre residencial', densidad: 'Baja densidad campestre',
      estatusLegal: 'Escriturado', gravamen: 'Predial 2026 al corriente',
      tiempoAcceso: '15 min al Centro', vialidad: 'Camino vecinal empedrado',
      luz: 'Poste CFE a 40 m', agua: 'Factibilidad de conexión a aguas termales o pozo',
      plusvaliaZonaPct: 48, etiqueta: 'Vista a la cañada',
      descripcion: 'Terreno en altura con vista panorámica a la cañada de Atotonilco. Suelo de alta permeabilidad, rodeado de mezquites centenarios. A quince minutos del corredor gastronómico.',
      dictamen: 'Conviene desplantar en terrazas de piedra braza integradas al terreno: se reduce el costo de nivelación y la casa queda escondida desde el camino.',
      fotos: [
        { url: U('1464822759023-fed622ff2c3b'), alt: 'Lote en altura con vista a la cañada' },
        { url: U('1506744038136-46273834b3fb'), alt: 'Panorámica de la cañada al atardecer' },
        { url: U('1501785888041-af3ef285b470'), alt: 'Cuerpo de agua en el entorno' },
        { url: U('1441974231531-c6227db76b6e'), alt: 'Vegetación del área aledaña' }
      ],
      creadoEn: '2026-09-02'
    },
    {
      id: 'SMA-C180', ref: 'SMA-C180', categoria: 'casa', zona: 'sma-centro', estatus: 'reservado', destacado: false,
      titulo: 'Loft de Autor Los Lavaderos',
      ubicacion: 'Barrio El Chorro, San Miguel de Allende',
      lat: 20.9122, lng: -100.7467,
      precioMxn: 6900000, superficieM2: 140, construccionM2: 180,
      geometria: 'Predio escalonado en ladera',
      normativa: '2 niveles + roof garden mirador',
      asoleamiento: 'Sur-Oriente', horasSol: 6,
      topografia: 'Niveles escalonados', suelo: 'Muros de contención en piedra y adobe',
      usoSuelo: 'Residencial boutique', densidad: 'Habitacional, densidad media',
      estatusLegal: 'Escritura notarial', gravamen: 'Libre de gravamen y de régimen condominal',
      tiempoAcceso: '3 min al Mirador El Chorro', vialidad: 'Callejón tradicional',
      luz: 'Acometida CFE subterránea', agua: 'Red SAPASMA con cisterna de 8,000 L',
      plusvaliaZonaPct: 32, etiqueta: 'Renta de estancias cortas',
      descripcion: 'Loft contemporáneo de dos niveles con adobe aparente estabilizado, ventanales de piso a techo con perfilería de acero negro y roof garden privado con fogatero y vista a los atardeceres de San Miguel.',
      dictamen: 'Por ubicación y escala funciona bien para estancias cortas de gama alta. La luz de la mañana entra por recámaras y terraza.',
      fotos: [
        { url: U('1522708323590-d24dbb6b0267'), alt: 'Sala del loft con ventanales' },
        { url: U('1502672260266-1c1ef2d93688'), alt: 'Cocina abierta con barra' },
        { url: U('1493809842364-78817add7ffb'), alt: 'Estancia con luz natural' },
        { url: U('1560448204-e02f11c3d0e2'), alt: 'Recámara con vista' }
      ],
      creadoEn: '2026-09-19'
    }
  ],

  /* Prospectos semilla. Las fechas se expresan en días relativos a "hoy"
   * y se convierten a ISO al sembrar el almacenamiento local. */
  prospectos: [
    {
      id: 'p1', creadoDias: -5, nombre: 'Ing. Roberto Alcántara', telefono: '+52 442 555 0142',
      email: 'roberto.alcantara@ejemplo.mx', inmuebleId: 'SMA-T2100', presupuesto: '$1.2M a $1.5M MXN',
      origen: 'Portal web', ejecutivo: 'Arq. Claudia Ramos', estatus: 'Cita agendada',
      bitacora: [
        { id: 'b1_1', dias: -5, hora: '10:15', ejecutivo: 'Arq. Claudia Ramos', tipo: 'Llamada telefónica',
          resumen: 'Llamada inicial y requerimientos',
          detalle: 'Busca terreno campestre para una casa de retiro familiar con vista abierta. Le interesó la topografía del lote y preguntó por el acceso para camioneta y la cercanía de CFE.',
          acuerdo: 'Inspección física en el lote.', proximoDias: 2, proximaHora: '11:00' },
        { id: 'b1_2', dias: -5, hora: '11:30', ejecutivo: 'Arq. Claudia Ramos', tipo: 'Envío de dossier',
          resumen: 'Ficha técnica, KML y curvas de nivel',
          detalle: 'Se compartió el dossier por WhatsApp y el archivo KML del perímetro para revisión con su constructor.',
          acuerdo: 'Revisará la huella máxima (COS 0.35) antes de la visita.', proximoDias: null }
      ]
    },
    {
      id: 'p2', creadoDias: -9, nombre: 'Dra. Mónica Villarreal', telefono: '+52 55 5555 0191',
      email: 'monica.villarreal@ejemplo.mx', inmuebleId: 'SMA-C380', presupuesto: '$800 mil a $1 M USD',
      origen: 'WhatsApp directo', ejecutivo: 'Lic. Roberto Valenzuela', estatus: 'Revisión notarial',
      bitacora: [
        { id: 'b2_1', dias: -9, hora: '16:30', ejecutivo: 'Lic. Roberto Valenzuela', tipo: 'Visita al inmueble',
          resumen: 'Recorrido guiado en Villa La Cantera',
          detalle: 'Recorrido de dos horas con su esposo. Les gustaron el patio y la terraza. Duda sobre la servidumbre de paso en la colindancia poniente.',
          acuerdo: 'Pidió copia de escritura y predial pagado para revisión con su abogado.', proximoDias: -8 },
        { id: 'b2_2', dias: -3, hora: '13:15', ejecutivo: 'Lic. Roberto Valenzuela', tipo: 'Revisión notarial',
          resumen: 'Documentación enviada a notaría',
          detalle: 'Se enviaron copias de escritura, predial pagado y manifestación catastral. La notaría confirmó título limpio y libre de gravamen.',
          acuerdo: 'La clienta revisa el borrador del contrato promesa con anticipo del 10%.', proximoDias: 1, proximaHora: '12:00' }
      ]
    },
    {
      id: 'p3', creadoDias: -11, nombre: 'Arq. Fernando Zavala', telefono: '+52 415 555 0177',
      email: 'fzavala@ejemplo.mx', inmuebleId: 'SMA-B1200', presupuesto: '$7.0 M MXN',
      origen: 'Recomendación', ejecutivo: 'Ing. Marco Aurelio Soto', estatus: 'En negociación',
      bitacora: [
        { id: 'b3_1', dias: -11, hora: '09:00', ejecutivo: 'Ing. Marco Aurelio Soto', tipo: 'Oferta / negociación',
          resumen: 'Carta oferta formal',
          detalle: 'Presentó una oferta de $6.8 M MXN de contado con entrega a 45 días. Pide verificar la capacidad de la subestación frente a CFE.',
          acuerdo: 'Se consultará al propietario una contraoferta de $7.0 M absorbiendo el costo de la fianza.', proximoDias: 3, proximaHora: '10:30' }
      ]
    }
  ]
};

// ============================================================
// BASE CURRICULAR NEM - FASE 6 - SECUNDARIA
// Programa Sintético - Acuerdo 08/08/23
// Campos Formativos, Disciplinas, Contenidos y PDAs
// ============================================================

const CURRICULUM = {

  // ============================================================
  // CAMPO 1: LENGUAJES
  // ============================================================
  "Lenguajes": {

    "Español": {
      contenidos: [
        {
          id: "ES01",
          num: 1,
          titulo: "La diversidad de lenguas y su uso en la comunicación familiar, escolar y comunitaria.",
          pdas: {
            "1": "Reconoce la riqueza lingüística de México y el mundo, a partir de obras literarias procedentes de distintas culturas.",
            "2": "Analiza y reconoce algunas variantes lingüísticas de la lengua española, para valorarla como riqueza cultural.",
            "3": "Analiza y reconoce algunas variantes lingüísticas de la lengua española, para valorarla como riqueza cultural."
          }
        },
        {
          id: "ES02",
          num: 2,
          titulo: "La diversidad étnica, cultural y lingüística de México a favor de una sociedad intercultural.",
          pdas: {
            "1": "Comprende las ideas centrales y secundarias de textos relacionados con la diversidad étnica, cultural y lingüística, que favorecen una sociedad intercultural, para comentarlas en forma oral y escrita.",
            "2": "Elabora textos argumentativos acerca de la interculturalidad crítica, para reconocer el valor de las lenguas, a fin de promoverlas y fortalecerlas.",
            "3": "Practica la comunicación asertiva y el diálogo intercultural en interacción con otras personas. Comparte una propuesta creativa propia en la que valore y promueva textos en español a favor de una sociedad intercultural."
          }
        },
        {
          id: "ES03",
          num: 3,
          titulo: "Las lenguas como manifestación de la identidad y del sentido de pertenencia.",
          pdas: {
            "1": "Describe en un texto cómo el lenguaje oral manifiesta las identidades personal y colectiva, para reconocer lo común y lo diferente.",
            "2": "Comprende y redacta textos narrativos sobre la construcción de la identidad y el sentido de pertenencia, a partir del análisis de variantes del español.",
            "3": "Elabora textos argumentativos acerca de la interculturalidad crítica, para reconocer el valor de las lenguas, a fin de promoverlas y fortalecerlas."
          }
        },
        {
          id: "ES04",
          num: 4,
          titulo: "El dinamismo de las lenguas y su relevancia como patrimonio cultural.",
          pdas: {
            "1": "Identifica y expresa la relevancia de valorar las lenguas como legado de la comunidad.",
            "2": "Identifica y expresa la relevancia de valorar las lenguas como legado de la comunidad.",
            "3": "Analiza en textos literarios neologismos, juegos de lenguajes, caló, jerga, préstamos lingüísticos y extranjerismos como parte del dinamismo de la lengua española."
          }
        },
        {
          id: "ES05",
          num: 5,
          titulo: "La función creativa del español en la expresión de necesidades e intereses comunitarios.",
          pdas: {
            "1": "Usa intencionalmente recursos creativos del español para expresar necesidades e intereses de la comunidad.",
            "2": "Crea textos literarios de distintos géneros para ofrecer una propuesta de solución a problemas de la comunidad.",
            "3": "Crea textos literarios de distintos géneros para ofrecer una propuesta de solución a problemas de la comunidad."
          }
        },
        {
          id: "ES06",
          num: 6,
          titulo: "Los elementos y los recursos estéticos de la lengua española en la literatura oral y escrita.",
          pdas: {
            "1": "Reconoce los recursos estéticos en textos literarios líricos, orales y escritos, y disfruta de poemas, canciones, juegos de palabras, entre otros.",
            "2": "Analiza las características y recursos estéticos de los textos narrativos, e interpreta y disfruta de cuentos y novelas.",
            "3": "Usa creativa e intencionalmente las características y los recursos estéticos de textos dramáticos, para escenificar situaciones vinculadas con la comunidad."
          }
        },
        {
          id: "ES07",
          num: 7,
          titulo: "Textos literarios escritos en español o traducidos.",
          pdas: {
            "1": "Recupera y clasifica creaciones literarias de la comunidad: mitos, leyendas, fábulas, corridos, canciones, juegos de palabras, para promover de manera creativa su lectura.",
            "2": "Analiza diversos textos literarios de su libre elección para expresar un juicio estético y lo comparte en la comunidad.",
            "3": "Elabora un ensayo acerca del tratamiento de un tema de su elección, con base en un género literario de su preferencia, para argumentar un juicio estético sobre éste."
          }
        },
        {
          id: "ES08",
          num: 8,
          titulo: "Creaciones literarias tradicionales y contemporáneas.",
          pdas: {
            "1": "Recupera y clasifica creaciones literarias de la comunidad o de un lugar de interés, como mitos, leyendas, fábulas, epopeyas, cantares de gesta, refranes, coplas, canciones, corridos, juegos de palabras, entre otras, para promover de manera creativa su lectura.",
            "2": "Valora textos literarios tradicionales y contemporáneos, como cuentos, novelas, poemas, textos dramáticos; los adapta a otros lenguajes para sensibilizar a la comunidad.",
            "3": "Crea textos narrativos, poéticos, dramáticos y guiones para audiovisuales, entre otros, a partir del uso de recursos literarios, para exponer una situación real o ficticia."
          }
        },
        {
          id: "ES09",
          num: 9,
          titulo: "Recursos literarios en lengua española para expresar sensaciones, emociones, sentimientos e ideas vinculados con las familias, la escuela y la comunidad.",
          pdas: {
            "1": "Identifica recursos literarios en lengua española y los emplea en la elaboración de cartas personales y biografías, para expresar sensaciones, emociones, sentimientos e ideas.",
            "2": "Recupera recursos literarios de la lengua española para crear un texto libre que describa los vínculos con el entorno familiar, escolar o comunitario.",
            "3": "Recupera recursos literarios de la lengua española para crear un texto libre que describa los vínculos con el entorno familiar, escolar o comunitario."
          }
        },
        {
          id: "ES10",
          num: 10,
          titulo: "Los géneros periodísticos y sus recursos para comunicar sucesos significativos familiares, escolares, comunitarios y sociales.",
          pdas: {
            "1": "Identifica las características y recursos de los géneros periodísticos para comunicar sucesos de la comunidad.",
            "2": "Analiza los sucesos más significativos de la comunidad y los comunica empleando características de los géneros periodísticos.",
            "3": "Analiza los sucesos más significativos de la comunidad y los comunica empleando las características de los géneros periodísticos de interpretación, para preservar la memoria colectiva."
          }
        },
        {
          id: "ES11",
          num: 11,
          titulo: "Comunicación asertiva y dialógica para erradicar expresiones de violencia.",
          pdas: {
            "1": "Practica la comunicación asertiva para identificar y erradicar expresiones de violencia en la escuela y la comunidad.",
            "2": "Discute de forma colectiva y diseña una estrategia sobre la importancia de sensibilizar a la comunidad acerca de la violencia.",
            "3": "Redacta un texto informativo acerca de la importancia de erradicar la violencia y realiza de manera formal las gestiones necesarias para compartirlo con la comunidad."
          }
        },
        {
          id: "ES12",
          num: 12,
          titulo: "Mensajes para promover una vida saludable, expresados en medios comunitarios o masivos de comunicación.",
          pdas: {
            "1": "Identifica las características y recursos de mensajes que promueven una vida saludable a través de diferentes medios de comunicación.",
            "2": "Construye narrativas acerca de una vida saludable, haciendo uso del lenguaje audiovisual.",
            "3": "Construye narrativas acerca de una vida saludable, haciendo uso del lenguaje audiovisual y la transmite por medios comunitarios o masivos de comunicación."
          }
        },
        {
          id: "ES13",
          num: 13,
          titulo: "Textos de divulgación científica.",
          pdas: {
            "1": "Identifica las características del texto de divulgación científica y elabora uno.",
            "2": "Elabora una propuesta de divulgación científica con la participación de la comunidad escolar.",
            "3": "Elabora una propuesta de divulgación científica, con la participación de la comunidad escolar, para fomentar el conocimiento de las ciencias."
          }
        },
        {
          id: "ES14",
          num: 14,
          titulo: "Manifestaciones culturales y artísticas que favorecen una sociedad incluyente.",
          pdas: {
            "1": "Reconoce manifestaciones culturales y artísticas creadas o ejecutadas por personas con alguna discapacidad, para distinguir sus valores estéticos y creativos.",
            "2": "Elabora un texto oral o escrito acerca de las manifestaciones culturales y artísticas, que promuevan una sociedad incluyente.",
            "3": "Crea textos literarios que aborden un tema que promueva una sociedad incluyente."
          }
        }
      ]
    },

    "Inglés": {
      contenidos: [
        {
          id: "IN01", num: 1,
          titulo: "La diversidad lingüística y sus formas de expresión en México y el mundo.",
          pdas: {
            "1": "Realiza una lectura crítica y emite su opinión en inglés sobre diversas manifestaciones culturales y artísticas de pueblos de habla inglesa.",
            "2": "Comprende textos narrativos y biográficos en inglés sobre la vida cotidiana, formas de interacción y comportamiento de hablantes de diversas lenguas.",
            "3": "Construye una propuesta de comunicación en inglés, oral y escrita, donde contraste, valora y promueva rasgos de una sociedad intercultural."
          }
        },
        {
          id: "IN02", num: 2,
          titulo: "La identidad y cultura de pueblos de habla inglesa.",
          pdas: {
            "1": "Recupera información para llevar a cabo presentaciones en inglés, orales y escritas, que describan rasgos étnicos, culturales e identitarios de hablantes de lengua inglesa.",
            "2": "Comprende y redacta textos narrativos sobre la construcción de la identidad y el sentido de pertenencia.",
            "3": "Construye una propuesta de comunicación en inglés donde contraste y promueva rasgos de una sociedad intercultural identificados en pueblos de habla inglesa."
          }
        },
        {
          id: "IN03", num: 3,
          titulo: "Las manifestaciones culturales, lingüísticas y artísticas en inglés, a favor de la interculturalidad.",
          pdas: {
            "1": "Interpreta juegos de roles en inglés, sobre situaciones que favorezcan la comunicación asertiva.",
            "2": "Interpreta juegos de roles en inglés, sobre situaciones que favorezcan la comunicación asertiva.",
            "3": "Practica la comunicación asertiva y el diálogo intercultural en inglés en interacción con otras personas."
          }
        },
        {
          id: "IN04", num: 4,
          titulo: "Uso de diversos textos en inglés que promueven la preservación y conservación de las lenguas.",
          pdas: {
            "1": "Recupera textos informativos y científicos en inglés, que refieran formas de conservación y preservación de las lenguas, y las difunde.",
            "2": "Recupera textos informativos en inglés sobre formas de conservación de las lenguas.",
            "3": "Recupera y difunde textos en inglés sobre la preservación de las lenguas."
          }
        },
        {
          id: "IN05", num: 5,
          titulo: "El uso del inglés para expresar necesidades, intereses y problemas de la comunidad.",
          pdas: {
            "1": "Organiza una campaña en inglés sobre soluciones a problemas de la comunidad.",
            "2": "Organiza una campaña en inglés sobre soluciones a problemas de la comunidad.",
            "3": "Organiza una campaña en inglés sobre soluciones a problemas de la comunidad."
          }
        },
        {
          id: "IN06", num: 6,
          titulo: "Elementos y recursos estéticos del inglés.",
          pdas: {
            "1": "Recupera de distintos tipos de textos literarios en inglés, expresiones, elementos y recursos estéticos y elabora un glosario.",
            "2": "Emplea algunas figuras retóricas, elementos y recursos estéticos, para construir un texto literario corto en inglés.",
            "3": "Usa intencionalmente figuras retóricas como metáforas, hipérboles, aliteraciones, en creaciones artísticas en inglés."
          }
        },
        {
          id: "IN07", num: 7,
          titulo: "Manifestaciones artísticas y culturales del inglés.",
          pdas: {
            "1": "Realiza una lectura crítica y emite su opinión en inglés sobre diversas manifestaciones culturales y artísticas de pueblos de habla inglesa.",
            "2": "Investiga y recupera manifestaciones culturales y artísticas de su comunidad, para difundirlas en inglés.",
            "3": "Investiga y recupera manifestaciones culturales y artísticas de su comunidad, para difundirlas en inglés."
          }
        },
        {
          id: "IN08", num: 8,
          titulo: "Creaciones literarias tradicionales y contemporáneas en inglés.",
          pdas: {
            "1": "Selecciona textos literarios en inglés que aborden temas de la comunidad, los resume y difunde por distintos medios.",
            "2": "Crea poemas cortos a partir del uso de recursos estéticos del inglés en producciones orales y escritas.",
            "3": "Crea textos breves en inglés para exponer una situación o tema de interés, con recursos narrativos, poéticos, visuales, escénicos o musicales."
          }
        },
        {
          id: "IN09", num: 9,
          titulo: "El inglés para expresar sensaciones, emociones, sentimientos e ideas vinculados con las familias, la escuela y la comunidad.",
          pdas: {
            "1": "Expresa en inglés sensaciones, emociones y sentimientos vinculados con su entorno familiar, escolar y comunitario.",
            "2": "Expresa en inglés sensaciones, emociones y sentimientos vinculados con su entorno.",
            "3": "Expresa en inglés sensaciones, emociones y sentimientos vinculados con su entorno."
          }
        },
        {
          id: "IN10", num: 10,
          titulo: "Relatos en inglés para expresar sucesos significativos familiares, escolares, comunitarios y sociales.",
          pdas: {
            "1": "Recupera un acontecimiento histórico comunitario y elabora un texto oral y escrito en inglés para expresar su postura.",
            "2": "Recupera un acontecimiento histórico comunitario y elabora un texto oral y escrito en inglés.",
            "3": "Recupera un acontecimiento histórico comunitario y elabora un texto oral y escrito en inglés, para expresar su postura, haciendo uso de recursos visuales o auditivos."
          }
        },
        {
          id: "IN11", num: 11,
          titulo: "Comunicación asertiva y dialógica en inglés, para sensibilizar sobre la erradicación de la violencia en las familias y la escuela.",
          pdas: {
            "1": "Diseña y difunde en inglés propuestas escritas para sensibilizar a la comunidad acerca de la importancia de erradicar la violencia.",
            "2": "Diseña y difunde en inglés propuestas escritas para sensibilizar a la comunidad acerca de la importancia de erradicar la violencia.",
            "3": "Diseña y difunde en inglés propuestas escritas para sensibilizar a la comunidad acerca de la importancia de erradicar la violencia."
          }
        },
        {
          id: "IN12", num: 12,
          titulo: "Mensajes en inglés en medios de comunicación masiva, que promuevan una vida saludable.",
          pdas: {
            "1": "Recupera en lengua inglesa mensajes que promuevan una vida saludable y los difunde de manera oral o escrita.",
            "2": "Cuenta historias en inglés sobre ejemplos de vida saludable y las difunde mediante el uso de medios de comunicación.",
            "3": "Cuenta historias en inglés sobre ejemplos de vida saludable y las difunde mediante el uso de medios de comunicación, para sensibilizar a la comunidad."
          }
        },
        {
          id: "IN13", num: 13,
          titulo: "El uso del inglés en la construcción de mensajes a favor de la inclusión.",
          pdas: {
            "1": "Investiga en diversas fuentes en inglés sobre mensajes que presentan información a favor de la interacción, sensibilización y empatía con la diversidad.",
            "2": "Investiga en diversas fuentes en inglés sobre mensajes a favor de la inclusión.",
            "3": "Crea mensajes en inglés que promuevan la inclusión en la comunidad escolar."
          }
        },
        {
          id: "IN14", num: 14,
          titulo: "El uso del inglés en las manifestaciones culturales y artísticas que favorecen la construcción de una sociedad incluyente.",
          pdas: {
            "1": "Realiza una lectura crítica y emite su opinión en inglés sobre diversas manifestaciones culturales y artísticas de pueblos de habla inglesa.",
            "2": "Realiza una lectura crítica y emite su opinión en inglés sobre manifestaciones culturales y artísticas que favorecen la inclusión.",
            "3": "Presenta una propuesta artística en inglés que favorezca la construcción de una sociedad incluyente."
          }
        }
      ]
    },

    "Artes": {
      contenidos: [
        {
          id: "AR01", num: 1,
          titulo: "Diversidad de lenguajes artísticos en la riqueza pluricultural de México y del mundo.",
          pdas: {
            "1": "Reconoce en manifestaciones artísticas de México y del mundo el uso del cuerpo, del espacio y del tiempo, para valorarlas como parte de la riqueza pluricultural.",
            "2": "Explora la creación de secuencias y patrones al identificar el uso de formas, colores, movimientos y sonidos en manifestaciones artísticas de México y del mundo.",
            "3": "Experimenta con características de algunos estilos de los lenguajes artísticos, para representar la riqueza pluricultural de México y del mundo."
          }
        },
        {
          id: "AR02", num: 2,
          titulo: "Manifestaciones culturales y artísticas que conforman la diversidad étnica, cultural y lingüística.",
          pdas: {
            "1": "Identifica diferentes manifestaciones culturales y artísticas de pueblos indígenas y afrodescendientes de México y del mundo.",
            "2": "Adapta textos literarios provenientes de culturas indígenas o afrodescendientes, experimentando con elementos de las artes.",
            "3": "Presenta una propuesta creativa usando intencionalmente el cuerpo, espacio y tiempo, para valorar y promover la diversidad étnica, cultural y lingüística."
          }
        },
        {
          id: "AR03", num: 3,
          titulo: "Identidad y sentido de pertenencia en manifestaciones artísticas.",
          pdas: {
            "1": "Interpreta manifestaciones artísticas del patrimonio cultural de la comunidad, para fomentar la identidad personal y colectiva.",
            "2": "Interpreta manifestaciones artísticas del patrimonio cultural de la comunidad, para fomentar la identidad personal y colectiva.",
            "3": "Crea propuestas artísticas utilizando intencionalmente características de algunos estilos artísticos, a favor de la interculturalidad crítica."
          }
        },
        {
          id: "AR04", num: 4,
          titulo: "Patrimonio cultural de la comunidad en manifestaciones artísticas que fomentan la identidad y el sentido de pertenencia.",
          pdas: {
            "1": "Interpreta manifestaciones artísticas del patrimonio cultural de la comunidad y de México, para fomentar la identidad personal y colectiva, así como el sentido de pertenencia.",
            "2": "Interpreta manifestaciones artísticas del patrimonio cultural de la comunidad y de México.",
            "3": "Reinterpreta de manera respetuosa manifestaciones artísticas del patrimonio cultural, para valorar su identidad y sentido de pertenencia."
          }
        },
        {
          id: "AR05", num: 5,
          titulo: "Los lenguajes artísticos en la expresión de problemas de la comunidad.",
          pdas: {
            "1": "Usa elementos artísticos para expresar problemas y proponer soluciones en la comunidad.",
            "2": "Experimenta con técnicas artísticas y elige una que implemente en un proyecto escolar creativo, para imaginar posibles soluciones a problemas de la comunidad.",
            "3": "Experimenta con técnicas artísticas para imaginar y expresar posibles soluciones a problemas de la comunidad."
          }
        },
        {
          id: "AR06", num: 6,
          titulo: "Elementos de las artes y recursos estéticos apreciados en el entorno natural y social, así como en diversas manifestaciones artísticas.",
          pdas: {
            "1": "Identifica el uso intencional del cuerpo, del espacio y del tiempo en manifestaciones artísticas, para apreciar e interpretar sus sentidos y significados.",
            "2": "Analiza el uso intencional de elementos de las artes y recursos estéticos como ritmo, repetición, armonía, contraste y variación, en manifestaciones artísticas.",
            "3": "Usa intencionalmente figuras retóricas como metáforas, hipérboles, sinécdoques, aliteraciones, en creaciones artísticas colectivas."
          }
        },
        {
          id: "AR07", num: 7,
          titulo: "Valor estético de la naturaleza, de la vida cotidiana y de diferentes manifestaciones culturales y artísticas.",
          pdas: {
            "1": "Disfruta de manifestaciones culturales y artísticas de la comunidad y de otros lugares, para reconocer sus gustos e intereses estéticos.",
            "2": "Identifica algunas categorías estéticas como lo bello, lo sublime, lo grotesco, lo trágico, lo cómico, al apreciarlas en manifestaciones culturales y artísticas.",
            "3": "Identifica algunas categorías estéticas como lo bello, lo sublime, lo grotesco, lo trágico, lo cómico, al apreciarlas en manifestaciones culturales y artísticas, para argumentar sus juicios estéticos."
          }
        },
        {
          id: "AR08", num: 8,
          titulo: "Creaciones artísticas que tienen su origen en textos literarios.",
          pdas: {
            "1": "Explora con formas, colores, movimientos, sonidos, para reinterpretar textos literarios de la comunidad u otros lugares, haciendo uso de diversos lenguajes artísticos.",
            "2": "Adapta textos literarios provenientes de culturas indígenas o afrodescendientes, experimentando con elementos de las artes y recursos estéticos.",
            "3": "Construye una narrativa personal o colectiva, a partir de un texto literario de su interés, empleando en forma artística cuerpo, espacio y tiempo."
          }
        },
        {
          id: "AR09", num: 9,
          titulo: "Expresión artística de sensaciones, emociones, sentimientos e ideas, a partir de experiencias familiares, escolares o comunitarias.",
          pdas: {
            "1": "Usa intencionalmente elementos de las artes para representar experiencias familiares, escolares o comunitarias.",
            "2": "Usa intencionalmente figuras retóricas para representar situaciones vinculadas a la comunidad.",
            "3": "Usa intencionalmente características y funciones de algunos géneros artísticos, para crear una obra original que simbolice sus vínculos con la comunidad."
          }
        },
        {
          id: "AR10", num: 10,
          titulo: "Memoria colectiva representada por medios artísticos, para registrar experiencias comunitarias.",
          pdas: {
            "1": "Representa mediante lenguajes artísticos experiencias significativas de la comunidad.",
            "2": "Registra mediante lenguajes artísticos experiencias significativas de la comunidad.",
            "3": "Manifiesta una postura crítica sobre la memoria colectiva, acerca de un acontecimiento relevante para la comunidad, al hacer uso de los lenguajes artísticos."
          }
        },
        {
          id: "AR11", num: 11,
          titulo: "Procesos creativos que ponen en práctica la comunicación dialógica, como estrategia para erradicar expresiones de violencia.",
          pdas: {
            "1": "Expresa, mediante elementos de las artes como las formas, colores, movimientos, sonidos, la relevancia del diálogo como alternativa a las manifestaciones de violencia.",
            "2": "Interviene el entorno natural y social, mediante el uso de los lenguajes artísticos, para expresar un mensaje a favor del cuidado del medioambiente.",
            "3": "Presenta al público una propuesta artística respetuosa y empática con la diversidad, para sensibilizar a la comunidad acerca de la importancia del diálogo para erradicar la violencia."
          }
        },
        {
          id: "AR12", num: 12,
          titulo: "Vida saludable expresada a través de mensajes construidos con elementos de las artes, para difundirlos por distintos medios de comunicación.",
          pdas: {
            "1": "Emplea intencionalmente formas, colores, movimientos, sonidos, para representar una vida saludable y la difunde por un medio de comunicación escolar.",
            "2": "Construye una narrativa a favor de una vida saludable, mediante el uso artístico de distintos formatos.",
            "3": "Construye una narrativa a favor de una vida saludable, mediante el uso artístico de distintos formatos como fotografía, historieta, secuencia corporal, secuencia sonora, entre otros, y la difunde por distintos medios de comunicación."
          }
        },
        {
          id: "AR13", num: 13,
          titulo: "Sistemas alternativos y aumentativos de comunicación, como herramientas creativas que favorecen la inclusión.",
          pdas: {
            "1": "Identifica algunas características sensoriales de la Lengua de Señas Mexicana, el código Braille, los tableros de comunicación y otros sistemas alternativos y aumentativos.",
            "2": "Crea códigos que favorezcan la inclusión, a través del uso artístico de formas, colores, texturas, movimientos, gestos, sonidos.",
            "3": "Crea códigos que favorezcan la inclusión, a través del uso artístico de formas, colores, texturas, movimientos, gestos, sonidos, entre otros recursos."
          }
        },
        {
          id: "AR14", num: 14,
          titulo: "Manifestaciones artísticas que emplean sistemas alternativos y aumentativos de comunicación, elaboradas por personas en condición de discapacidad y/o diseñadas para ellas.",
          pdas: {
            "1": "Identifica diferentes manifestaciones culturales y artísticas creadas o ejecutadas por personas con alguna discapacidad.",
            "2": "Presenta una creación artística en la que experimente con sistemas alternativos y aumentativos de comunicación.",
            "3": "Presenta una creación artística en la que experimente con sistemas alternativos y aumentativos de comunicación, para favorecer el tránsito a una sociedad incluyente."
          }
        }
      ]
    }
  },

  // ============================================================
  // CAMPO 2: SABERES Y PENSAMIENTO CIENTÍFICO
  // ============================================================
  "Saberes y pensamiento científico": {

    "Matemáticas": {
      contenidos: [
        {
          id: "MA01", num: 1,
          titulo: "Expresión de fracciones como decimales y de decimales como fracciones.",
          pdas: { "1": "Convierte fracciones a decimales y decimales a fracciones, comprendiendo su equivalencia y aplicándola en contextos cotidianos.", "2": "N/A", "3": "N/A" }
        },
        {
          id: "MA02", num: 2,
          titulo: "Extensión de los números a positivos y negativos y su orden.",
          pdas: {
            "1": "Reconoce la necesidad de los números negativos a partir de usar cantidades que tienen al cero como referencia. Compara y ordena números con signo en la recta numérica.",
            "2": "Usa la notación científica al realizar cálculos con cantidades muy grandes o muy pequeñas.",
            "3": "N/A"
          }
        },
        {
          id: "MA03", num: 3,
          titulo: "Extensión del significado de las operaciones y sus relaciones inversas.",
          pdas: {
            "1": "Reconoce el significado de las cuatro operaciones básicas y sus relaciones inversas al resolver problemas con números con signo. Comprueba si las operaciones cumplen las propiedades conmutativa, asociativa y distributiva.",
            "2": "Usa la notación científica al realizar cálculos con cantidades muy grandes o muy pequeñas.",
            "3": "N/A"
          }
        },
        {
          id: "MA04", num: 4,
          titulo: "Regularidades y patrones.",
          pdas: {
            "1": "Identifica, describe y construye regularidades y patrones numéricos y geométricos.",
            "2": "Identifica, describe y construye regularidades y patrones numéricos y geométricos.",
            "3": "N/A"
          }
        },
        {
          id: "MA05", num: 5,
          titulo: "Introducción al álgebra.",
          pdas: {
            "1": "Usa expresiones algebraicas sencillas para representar situaciones y problemas.",
            "2": "Usa expresiones algebraicas para representar y resolver situaciones.",
            "3": "Usa el álgebra como lenguaje para representar y resolver problemas complejos."
          }
        },
        {
          id: "MA06", num: 6,
          titulo: "Ecuaciones lineales y cuadráticas.",
          pdas: {
            "1": "Plantea y resuelve ecuaciones lineales con una incógnita en contextos variados.",
            "2": "Plantea y resuelve ecuaciones lineales y sistemas de ecuaciones lineales con dos incógnitas.",
            "3": "Plantea y resuelve ecuaciones cuadráticas en contextos variados."
          }
        },
        {
          id: "MA07", num: 7,
          titulo: "Funciones.",
          pdas: {
            "1": "Relaciona e interpreta relaciones proporcional y no proporcional a partir de su representación tabular, gráfica y con diagramas.",
            "2": "Relaciona e interpreta funciones lineales y sus representaciones.",
            "3": "Interpreta y representa funciones cuadráticas en sus diferentes formas."
          }
        },
        {
          id: "MA08", num: 8,
          titulo: "Rectas y ángulos.",
          pdas: {
            "1": "Introduce la idea de distancia entre dos puntos. Encuentra la distancia de un punto a una recta y la distancia entre dos rectas paralelas.",
            "2": "Identifica y usa las relaciones entre los ángulos, lados y diagonales para construir triángulos, cuadriláteros y polígonos.",
            "3": "N/A"
          }
        },
        {
          id: "MA09", num: 9,
          titulo: "Construcción y propiedades de las figuras planas y cuerpos.",
          pdas: {
            "1": "Obtiene y aplica fórmulas para calcular el perímetro y el área de polígonos regulares e irregulares y del círculo.",
            "2": "Construye con regla y compás polígonos regulares. Identifica y usa las relaciones entre figuras en la construcción de teselados.",
            "3": "Reconoce las propiedades de los sólidos. Explora la generación de sólidos de revolución. Explora y construye desarrollos planos de diferentes figuras tridimensionales."
          }
        },
        {
          id: "MA10", num: 10,
          titulo: "Circunferencia, círculo y esfera.",
          pdas: {
            "1": "Calcula longitud de circunferencia y área del círculo. Reconoce propiedades de la esfera.",
            "2": "Calcula longitudes y áreas relacionadas con circunferencia y círculo en contextos variados.",
            "3": "Aplica propiedades de circunferencia, círculo y esfera en resolución de problemas."
          }
        },
        {
          id: "MA11", num: 11,
          titulo: "Medición y cálculo en diferentes contextos.",
          pdas: {
            "1": "Resuelve problemas que implican calcular medidas en contextos geométricos y de la vida cotidiana.",
            "2": "Resuelve problemas que implican calcular medidas en contextos geométricos y de la vida cotidiana.",
            "3": "Resuelve problemas que implican calcular medidas en contextos complejos."
          }
        },
        {
          id: "MA12", num: 12,
          titulo: "Obtención y representación de información.",
          pdas: {
            "1": "Usa tablas, gráficas de barras y circulares para el análisis de información.",
            "2": "Usa tablas y gráficas para analizar e interpretar información estadística.",
            "3": "Obtiene y representa información estadística usando diversas gráficas."
          }
        },
        {
          id: "MA13", num: 13,
          titulo: "Interpretación de la información a través de medidas de tendencia central y de dispersión.",
          pdas: {
            "1": "Determina e interpreta la frecuencia absoluta, la frecuencia relativa, la media, la mediana y la moda en un conjunto de datos.",
            "2": "Determina e interpreta medidas de tendencia central y de dispersión en un conjunto de datos.",
            "3": "Determina y compara las medidas de tendencia central (media, mediana y moda) y de dispersión (rango y desviación media) de dos conjuntos de datos para tomar decisiones."
          }
        },
        {
          id: "MA14", num: 14,
          titulo: "Azar y probabilidad.",
          pdas: {
            "1": "Compara cualitativamente dos o más eventos a partir de sus resultados posibles. Identifica eventos en los que interviene el azar, determina el espacio muestral y experimenta.",
            "2": "Calcula probabilidades de eventos simples y compuestos.",
            "3": "Resuelve problemas donde se calcule la posibilidad de ocurrencia de dos eventos independientes (regla del producto)."
          }
        }
      ]
    },

    "Biología": {
      grado: "1",
      contenidos: [
        {
          id: "BI01", num: 1,
          titulo: "Funcionamiento del cuerpo humano coordinado por los sistemas nervioso y endocrino.",
          pdas: { "1": "Describe la función de coordinación de los sistemas nervioso y endocrino en el organismo humano, relacionándola con situaciones de la vida cotidiana." }
        },
        {
          id: "BI02", num: 2,
          titulo: "Salud sexual y reproductiva: prevención de infecciones de transmisión sexual y del embarazo en adolescentes.",
          pdas: { "1": "Compara las maneras en que la cultura influye en el concepto de sexualidad. Valora el uso consistente del condón para disminuir el riesgo de infecciones de transmisión sexual." }
        },
        {
          id: "BI03", num: 3,
          titulo: "Prevención de enfermedades relacionadas con la alimentación y el consumo de alimentos ultraprocesados.",
          pdas: { "1": "Analiza la relación entre la alimentación, los alimentos ultraprocesados y las enfermedades, para proponer hábitos saludables en su comunidad." }
        },
        {
          id: "BI04", num: 4,
          titulo: "La diversidad de saberes e intercambio de conocimientos acerca de los seres vivos y las relaciones con el medio ambiente.",
          pdas: { "1": "Reconoce la importancia de los conocimientos, prácticas e innovaciones de los pueblos originarios acerca de los seres vivos." }
        },
        {
          id: "BI05", num: 5,
          titulo: "Los procesos vitales de los seres vivos: nutrición, relación con el medio y reproducción.",
          pdas: { "1": "Describe y compara los procesos vitales de nutrición, relación con el medio y reproducción en distintos tipos de seres vivos." }
        },
        {
          id: "BI06", num: 6,
          titulo: "La biodiversidad como expresión del cambio de los seres vivos en el tiempo.",
          pdas: { "1": "Analiza información acerca del estado de la biodiversidad local. Indaga las principales aportaciones de Darwin y Wallace sobre el origen de la biodiversidad." }
        },
        {
          id: "BI07", num: 7,
          titulo: "El calentamiento global como una consecuencia de la alteración de los ciclos biogeoquímicos en los ecosistemas.",
          pdas: { "1": "Explica la relación entre el calentamiento global y la alteración de los ciclos biogeoquímicos, proponiendo acciones para mitigar sus efectos en la comunidad." }
        },
        {
          id: "BI08", num: 8,
          titulo: "Importancia del microscopio para el conocimiento de la unidad y la diversidad de los seres vivos.",
          pdas: { "1": "Compara cómo han cambiado las primeras observaciones microscópicas respecto a las actuales. Describe las estructuras y funciones básicas de la célula." }
        },
        {
          id: "BI09", num: 9,
          titulo: "Las vacunas: su relevancia en el control de algunas enfermedades infecciosas.",
          pdas: { "1": "Valora la importancia y la necesidad de proteger la salud a partir del uso de las vacunas para el control de algunas enfermedades infecciosas." }
        }
      ]
    },

    "Física": {
      grado: "2",
      contenidos: [
        {
          id: "FI01", num: 1,
          titulo: "El pensamiento científico, una forma de plantear y solucionar problemas y su incidencia en la transformación de la sociedad.",
          pdas: { "2": "Analiza situaciones cotidianas usando el método científico para plantear y resolver problemas." }
        },
        {
          id: "FI02", num: 2,
          titulo: "Unidades y medidas utilizados en Física.",
          pdas: { "2": "Identifica las unidades básicas y derivadas del Sistema Internacional, conoce los instrumentos de medición y realiza conversiones." }
        },
        {
          id: "FI03", num: 3,
          titulo: "Estructura, propiedades y características de la materia.",
          pdas: { "2": "Describe la estructura de la materia y sus propiedades, relacionándolas con fenómenos cotidianos." }
        },
        {
          id: "FI04", num: 4,
          titulo: "Estados de agregación de la materia.",
          pdas: { "2": "Explica las características de los estados sólido, líquido y gaseoso de la materia y los cambios de estado en situaciones cotidianas." }
        },
        {
          id: "FI05", num: 5,
          titulo: "Interacciones en fenómenos relacionados con la fuerza y el movimiento.",
          pdas: { "2": "Analiza fenómenos de movimiento y fuerza en situaciones cotidianas, aplicando conceptos de velocidad, aceleración y fricción." }
        },
        {
          id: "FI06", num: 6,
          titulo: "Principios de Pascal y de Arquímedes.",
          pdas: { "2": "Explica los principios de Pascal y Arquímedes y los relaciona con situaciones cotidianas y tecnológicas." }
        },
        {
          id: "FI07", num: 7,
          titulo: "Saberes y prácticas para el aprovechamiento de energías y la sustentabilidad.",
          pdas: { "2": "Identifica saberes, prácticas y artefactos sobre el aprovechamiento de las diversas formas de energía renovables y no renovables. Analiza las características de la energía mecánica." }
        },
        {
          id: "FI08", num: 8,
          titulo: "Interacciones de la electricidad y el magnetismo.",
          pdas: { "2": "Explica fenómenos eléctricos y magnéticos básicos, identificando sus aplicaciones tecnológicas en la vida cotidiana." }
        },
        {
          id: "FI09", num: 9,
          titulo: "Composición del Universo y el Sistema Solar.",
          pdas: { "2": "Describe la composición del Universo y el Sistema Solar, relacionando fenómenos astronómicos con la vida en la Tierra." }
        },
        {
          id: "FI10", num: 10,
          titulo: "Fenómenos, procesos y factores asociados al cambio climático.",
          pdas: { "2": "Formula hipótesis que relacionan la actividad humana con el aumento de temperatura en el planeta. Propone medidas de mitigación y adaptación al cambio climático." }
        }
      ]
    },

    "Química": {
      grado: "3",
      contenidos: [
        {
          id: "QU01", num: 1,
          titulo: "Los hitos que contribuyeron al avance del conocimiento científico y tecnológico en el ámbito nacional e internacional.",
          pdas: { "3": "Analiza hitos científicos y tecnológicos nacionales e internacionales, relacionando su impacto en la satisfacción de necesidades humanas y sus implicaciones en la naturaleza." }
        },
        {
          id: "QU02", num: 2,
          titulo: "Las propiedades extensivas e intensivas, como una forma de identificar sustancias y materiales de uso común.",
          pdas: { "3": "Formula hipótesis para diferenciar propiedades extensivas e intensivas, mediante actividades experimentales." }
        },
        {
          id: "QU03", num: 3,
          titulo: "Composición de las mezclas y su clasificación en homogéneas y heterogéneas, así como métodos de separación aplicados en diferentes contextos.",
          pdas: { "3": "Describe los componentes de una mezcla mediante actividades experimentales de uso cotidiano. Deduce métodos para separar mezclas (evaporación, decantación, filtración, extracción, sublimación, cromatografía, cristalización)." }
        },
        {
          id: "QU04", num: 4,
          titulo: "Importancia de la concentración de sustancias en mezclas de productos de uso cotidiano.",
          pdas: { "3": "Analiza la concentración de sustancias de una mezcla expresadas en porcentaje en masa y en volumen de distintos productos, orientadas al cuidado de la salud y al consumo responsable." }
        },
        {
          id: "QU05", num: 5,
          titulo: "Presencia de contaminantes y su concentración, relacionada con la degradación y contaminación ambiental en la comunidad.",
          pdas: { "3": "Identifica y analiza la presencia de contaminantes en el ambiente, relacionando su concentración con la degradación ambiental en la comunidad." }
        },
        {
          id: "QU06", num: 6,
          titulo: "Mezclas, compuestos y elementos representados con el modelo corpuscular de la materia.",
          pdas: { "3": "Representa y caracteriza mezclas, compuestos y elementos usando el modelo corpuscular de la materia en sólidos, líquidos y gases." }
        },
        {
          id: "QU07", num: 7,
          titulo: "La Tabla periódica: criterios de clasificación de los elementos químicos y sus propiedades.",
          pdas: { "3": "Analiza los criterios de clasificación de los elementos químicos en la Tabla Periódica y sus propiedades (electronegatividad, energía de ionización y radio atómico)." }
        },
        {
          id: "QU08", num: 8,
          titulo: "Los compuestos iónicos y moleculares: propiedades y estructura, así como su importancia en diferentes ámbitos.",
          pdas: { "3": "Describe las propiedades y estructura de los compuestos iónicos y moleculares, y su importancia en contextos científicos, tecnológicos y cotidianos." }
        },
        {
          id: "QU09", num: 9,
          titulo: "Los alimentos como fuente de energía química: carbohidratos, proteínas y lípidos.",
          pdas: { "3": "Analiza la función energética de carbohidratos, proteínas y lípidos en el organismo, relacionando su consumo con hábitos alimenticios saludables." }
        },
        {
          id: "QU10", num: 10,
          titulo: "Las reacciones químicas: manifestaciones, propiedades e interpretación de las ecuaciones químicas con base en la Ley de conservación de la materia.",
          pdas: { "3": "Reconoce distintas reacciones químicas en su entorno. Representa reacciones mediante modelos y ecuaciones químicas, con base en la Ley de conservación de la materia." }
        },
        {
          id: "QU11", num: 11,
          titulo: "Propiedades de ácidos y bases, reacciones de neutralización y modelo de Arrhenius.",
          pdas: { "3": "Identifica las propiedades de ácidos y bases, explica las reacciones de neutralización usando el modelo de Arrhenius y las relaciona con situaciones cotidianas." }
        },
        {
          id: "QU12", num: 12,
          titulo: "Las reacciones de óxido-reducción (redox): identificación del número de oxidación y de agentes oxidantes y reductores.",
          pdas: { "3": "Identifica el número de oxidación en compuestos y reconoce agentes oxidantes y reductores en reacciones redox cotidianas e industriales." }
        }
      ]
    }
  },

  // ============================================================
  // CAMPO 3: ÉTICA, NATURALEZA Y SOCIEDADES
  // ============================================================
  "Ética, naturaleza y sociedades": {

    "Historia": {
      contenidos: [
        {
          id: "HI01", num: 1,
          titulo: "Los albores de la humanidad: los pueblos antiguos del mundo y su devenir.",
          pdas: {
            "1": "Conoce sistemas para abordar la historia de los primeros pueblos. Emplea sistemas para ubicar en el espacio y en el tiempo aspectos de la vida cotidiana de los pueblos antiguos de Mesoamérica, Aridoamérica y Oasisamérica.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "HI02", num: 2,
          titulo: "La conformación de las metrópolis y los sistemas de dominación.",
          pdas: {
            "1": "Formula preguntas, recopila información y comparte hallazgos en torno a los pueblos originarios de México. Indaga los orígenes de la población afromexicana y sus aportaciones a la cultura del país.",
            "2": "Indaga acerca de las tensiones y alianzas políticas entre los señoríos mesoamericanos previo al arribo de los colonizadores. Revisa y contextualiza las campañas militares de Hernán Cortés.",
            "3": "Analiza la disputa entre países hegemónicos por la posesión de territorios en América, África y Asia. Caracteriza las colonizaciones realizadas por españoles, portugueses, ingleses, franceses y holandeses."
          }
        },
        {
          id: "HI03", num: 3,
          titulo: "Las gestas de resistencia y los movimientos independentistas.",
          pdas: {
            "1": "Identifica las gestas de resistencia de los pueblos ante los sistemas de dominación.",
            "2": "N/A",
            "3": "Elabora una cronología de las luchas de independencia de los países de Latinoamérica, incorporando datos, fechas, nombres, lugares y personajes históricos."
          }
        },
        {
          id: "HI04", num: 4,
          titulo: "Las revoluciones modernas y sus tendencias.",
          pdas: {
            "1": "N/A",
            "2": "Establece las características y el contexto en que se desarrolla la dictadura de Antonio López de Santa Anna. Analiza las Leyes de Reforma expedidas entre 1859 y 1861.",
            "3": "N/A"
          }
        },
        {
          id: "HI05", num: 5,
          titulo: "Las tensiones en el siglo XX.",
          pdas: {
            "1": "N/A",
            "2": "Analiza y comprende la causalidad de la revolución mexicana de 1910. Pondera las demandas sociales que la orientaron y la participación de los diferentes grupos sociales.",
            "3": "Analiza y comprende las causas y consecuencias de la Segunda Revolución Industrial. Explica las causas de la Primera y Segunda Guerra Mundial. Analiza las causas de la desintegración del bloque socialista."
          }
        },
        {
          id: "HI06", num: 6,
          titulo: "La construcción histórica de las ideas sobre las juventudes e infancias.",
          pdas: { "1": "Analiza cómo han cambiado históricamente las concepciones sobre la juventud y la infancia.", "2": "N/A", "3": "N/A" }
        },
        {
          id: "HI07", num: 7,
          titulo: "Las mujeres y sus historias.",
          pdas: {
            "1": "Revisa fuentes históricas para identificar la participación de las mujeres en la sociedad en diversos momentos históricos.",
            "2": "N/A", "3": "N/A"
          }
        },
        {
          id: "HI08", num: 8,
          titulo: "Las luchas de las mujeres por sus derechos.",
          pdas: {
            "1": "Identifica los orígenes históricos de movimientos y organizaciones de mujeres en la lucha por la igualdad y el reconocimiento de sus derechos.",
            "2": "N/A", "3": "N/A"
          }
        },
        {
          id: "HI09", num: 9,
          titulo: "Relaciones de poder y lucha por los derechos de grupos históricamente discriminados o subrepresentados.",
          pdas: { "1": "Analiza las relaciones de poder y la lucha histórica de grupos discriminados por sus derechos.", "2": "N/A", "3": "N/A" }
        },
        {
          id: "HI10", num: 10,
          titulo: "Discriminación, racismo y prejuicios como construcciones históricas.",
          pdas: {
            "1": "Comprende las causas y consecuencias históricas del racismo y propone acciones en su vida cotidiana para combatirlo.",
            "2": "N/A", "3": "N/A"
          }
        },
        {
          id: "HI11", num: 11,
          titulo: "Movilidades humanas, migraciones y nuevos escenarios para la vida.",
          pdas: { "1": "Comprende procesos históricos relevantes en los que grupos humanos se desplazaron por los territorios a lo largo del tiempo.", "2": "N/A", "3": "N/A" }
        },
        {
          id: "HI12", num: 12,
          titulo: "Amor, amistad, familias y relaciones entre las personas.",
          pdas: { "1": "Analiza cómo han cambiado históricamente las concepciones sobre el amor, la amistad y las relaciones familiares.", "2": "N/A", "3": "N/A" }
        }
      ]
    },

    "Geografía": {
      grado: "1",
      contenidos: [
        {
          id: "GE01", num: 1,
          titulo: "El espacio geográfico como una construcción social y colectiva.",
          pdas: { "1": "Analiza el espacio geográfico como resultado de la interacción entre la sociedad y la naturaleza." }
        },
        {
          id: "GE02", num: 2,
          titulo: "Las categorías de análisis espacial y representaciones del espacio geográfico.",
          pdas: { "1": "Usa categorías de análisis espacial y diversas representaciones geográficas para comprender el territorio." }
        },
        {
          id: "GE03", num: 3,
          titulo: "La distribución y dinámica de las aguas continentales y oceánicas en la Tierra.",
          pdas: { "1": "Analiza la distribución y dinámica de las aguas continentales y oceánicas y su importancia para la vida." }
        },
        {
          id: "GE04", num: 4,
          titulo: "La relación de las placas tectónicas con el relieve, la sismicidad y el vulcanismo.",
          pdas: { "1": "Relaciona el movimiento de las placas tectónicas con los fenómenos de relieve, sismicidad y vulcanismo." }
        },
        {
          id: "GE05", num: 5,
          titulo: "Los riesgos de desastre, su relación con los procesos naturales y la vulnerabilidad de la población en lugares específicos.",
          pdas: { "1": "Identifica que los desastres pueden ser originados por procesos naturales o por las actividades humanas. Valora la importancia de consolidar una cultura de prevención de desastres." }
        },
        {
          id: "GE06", num: 6,
          titulo: "Crecimiento, distribución, composición y migración de la población.",
          pdas: { "1": "Analiza las implicaciones sociales, ambientales y económicas del crecimiento, distribución y composición de la población." }
        },
        {
          id: "GE07", num: 7,
          titulo: "Los procesos productivos y sus consecuencias ambientales y sociales en la comunidad, México y el mundo.",
          pdas: { "1": "Compara procesos productivos y espacios económicos en México y el mundo, para reconocer sus implicaciones sociales, económicas y ambientales." }
        },
        {
          id: "GE08", num: 8,
          titulo: "Las prácticas de producción, distribución y consumo sustentables como alternativas para preservar el medio ambiente.",
          pdas: { "1": "Analiza prácticas sustentables de producción, distribución y consumo como alternativas para preservar el medio ambiente." }
        },
        {
          id: "GE09", num: 9,
          titulo: "Las desigualdades socioeconómicas en México y el mundo, y sus efectos en la calidad de vida de las personas.",
          pdas: { "1": "Analiza las desigualdades socioeconómicas en México y el mundo y sus efectos en la calidad de vida de las personas." }
        },
        {
          id: "GE10", num: 10,
          titulo: "Los conflictos territoriales actuales en México y el mundo, y sus implicaciones ambientales y sociales.",
          pdas: { "1": "Analiza conflictos territoriales actuales en México y el mundo, identificando sus implicaciones ambientales y sociales." }
        },
        {
          id: "GE11", num: 11,
          titulo: "Los retos sociales y ambientales en la comunidad, en México y el mundo.",
          pdas: { "1": "Reconoce cómo las problemáticas sociales y ambientales afectan a la comunidad. Asume responsabilidad como agente de cambio para encontrar soluciones." }
        },
        {
          id: "GE12", num: 12,
          titulo: "La diversidad de grupos sociales y culturales en México.",
          pdas: { "1": "Reconoce la diversidad de pueblos originarios, afromexicanos, migrantes y grupos sociales en México, como parte de la identidad nacional pluricultural." }
        },
        {
          id: "GE13", num: 13,
          titulo: "El suelo, recurso estratégico para la seguridad alimentaria y la vida en el planeta.",
          pdas: { "1": "Indaga sobre el origen, los usos y los problemas del suelo en la localidad. Comparte alternativas para la protección y recuperación del suelo." }
        },
        {
          id: "GE14", num: 14,
          titulo: "El reto del cambio climático.",
          pdas: { "1": "Analiza el cambio climático como un reto global, identificando sus causas, consecuencias y posibles soluciones desde la comunidad." }
        }
      ]
    },

    "Formación Cívica y Ética": {
      contenidos: [
        {
          id: "FC01", num: 1,
          titulo: "Grupos sociales y culturales en la conformación de las identidades juveniles.",
          pdas: {
            "1": "Analiza cómo los grupos sociales y culturales contribuyen a la conformación de la identidad juvenil.",
            "2": "Analiza cómo los grupos sociales y culturales contribuyen a la conformación de la identidad juvenil.",
            "3": "Promueve espacios de participación juvenil para construir comunidades que promuevan la colaboración y el respeto."
          }
        },
        {
          id: "FC02", num: 2,
          titulo: "Los derechos humanos en México y en el mundo como valores compartidos por las sociedades actuales.",
          pdas: {
            "1": "Analiza los derechos humanos como valores compartidos y fundamentales para la convivencia en México y el mundo.",
            "2": "Propone acciones orientadas a fortalecer la igualdad, el bienestar colectivo y el respeto a los derechos humanos.",
            "3": "Promueve el ejercicio de los derechos humanos en la comunidad escolar."
          }
        },
        {
          id: "FC03", num: 3,
          titulo: "Movimientos sociales y políticos por los derechos humanos en el mundo y en México.",
          pdas: {
            "1": "Analiza movimientos sociales y políticos que han luchado por el reconocimiento y defensa de los derechos humanos.",
            "2": "Analiza movimientos sociales y políticos por los derechos humanos.",
            "3": "Analiza movimientos sociales y políticos por los derechos humanos en México y el mundo."
          }
        },
        {
          id: "FC04", num: 4,
          titulo: "Consecuencias de la desigualdad en la calidad de vida de las personas y comunidades.",
          pdas: {
            "1": "Analiza las causas que dan origen a las diferencias en la calidad de vida de la población en México y el mundo.",
            "2": "Analiza las causas y consecuencias de la desigualdad social.",
            "3": "Analiza las consecuencias de la desigualdad en la calidad de vida de las personas."
          }
        },
        {
          id: "FC05", num: 5,
          titulo: "Normas, leyes, instituciones y organizaciones encargadas de proteger, defender y exigir la aplicación de los derechos humanos en la convivencia diaria.",
          pdas: {
            "1": "Identifica las normas, leyes, instituciones y organizaciones que protegen los derechos humanos.",
            "2": "Identifica las normas, leyes e instituciones que protegen los derechos humanos.",
            "3": "Identifica y valora las normas, leyes e instituciones que protegen los derechos humanos."
          }
        },
        {
          id: "FC06", num: 6,
          titulo: "El conflicto en la convivencia humana desde la cultura de paz.",
          pdas: {
            "1": "Analiza distintos tipos de conflictos en sus espacios de convivencia, su estructura y formas de solucionarlos desde la cultura de paz.",
            "2": "Analiza conflictos y propone soluciones desde la cultura de paz.",
            "3": "Analiza conflictos y propone soluciones desde la cultura de paz en la comunidad."
          }
        },
        {
          id: "FC07", num: 7,
          titulo: "La cultura de paz y la creación de ambientes que garanticen el respeto a la vida y la dignidad del ser humano.",
          pdas: {
            "1": "Promueve la cultura de paz en los distintos ámbitos de su vida.",
            "2": "Promueve la cultura de paz en los distintos ámbitos de su vida.",
            "3": "Promueve la cultura de paz en los distintos ámbitos de su vida y comunidad."
          }
        },
        {
          id: "FC08", num: 8,
          titulo: "Personas, grupos y organizaciones a favor de la cultura de paz.",
          pdas: {
            "1": "Identifica y valora a personas, grupos y organizaciones que trabajan a favor de la cultura de paz.",
            "2": "Identifica y valora a personas, grupos y organizaciones que trabajan a favor de la cultura de paz.",
            "3": "Identifica y valora a personas, grupos y organizaciones que trabajan a favor de la cultura de paz."
          }
        },
        {
          id: "FC09", num: 9,
          titulo: "Principios éticos como referente para un desarrollo sustentable.",
          pdas: {
            "1": "Reflexiona éticamente acerca de la relación de las comunidades con su contexto socionatural para impulsar acciones que promuevan el desarrollo sustentable.",
            "2": "Evalúa la contribución de la ética en las prácticas de producción, distribución y consumo de bienes y servicios, para generar alternativas de desarrollo sustentable.",
            "3": "Implementa acciones de colaboración, reciprocidad, solidaridad y de participación igualitaria como valores para un desarrollo sustentable."
          }
        },
        {
          id: "FC10", num: 10,
          titulo: "Igualdad sustantiva en el marco de la interculturalidad, la inclusión y la perspectiva de género.",
          pdas: {
            "1": "Aprecia la interculturalidad y el respeto al derecho a la igualdad sustantiva para establecer relaciones incluyentes y respetuosas de la diversidad.",
            "2": "Aprecia la interculturalidad y el respeto al derecho a la igualdad sustantiva.",
            "3": "Aprecia la interculturalidad y el respeto al derecho a la igualdad sustantiva para establecer relaciones incluyentes."
          }
        },
        {
          id: "FC11", num: 11,
          titulo: "Medidas de protección y mecanismos de denuncia en el rechazo a la violencia de género, sexual y la trata de personas.",
          pdas: {
            "1": "Analiza situaciones de violencia escolar, de género, sexual y la trata de personas, con base en la perspectiva de género.",
            "2": "Compara los tipos de violencia escolar, de género y la trata de personas e identifica medidas de protección y mecanismos de denuncia.",
            "3": "Analiza situaciones de violencia y propone estrategias de protección y denuncia."
          }
        },
        {
          id: "FC12", num: 12,
          titulo: "Principios y valores de la cultura democrática como forma de gobierno y de vida.",
          pdas: {
            "1": "Analiza los principios y valores de la cultura democrática como forma de gobierno y de vida.",
            "2": "Analiza los principios y valores de la cultura democrática.",
            "3": "Promueve los principios y valores de la cultura democrática en la comunidad."
          }
        },
        {
          id: "FC13", num: 13,
          titulo: "Proyectos como un recurso para atender problemáticas de la comunidad desde una ciudadanía democrática.",
          pdas: {
            "1": "Diseña y participa en proyectos ciudadanos para atender problemáticas de la comunidad.",
            "2": "Diseña y participa en proyectos ciudadanos para atender problemáticas de la comunidad.",
            "3": "Diseña y participa en proyectos ciudadanos para atender problemáticas de la comunidad."
          }
        },
        {
          id: "FC14", num: 14,
          titulo: "Instituciones, organizaciones y mecanismos de representación democrática.",
          pdas: {
            "1": "Identifica las instituciones, organizaciones y mecanismos de representación democrática en México.",
            "2": "Identifica las instituciones, organizaciones y mecanismos de representación democrática.",
            "3": "Valora el funcionamiento de las instituciones y mecanismos de representación democrática."
          }
        },
        {
          id: "FC15", num: 15,
          titulo: "Defensa del derecho al acceso a la protección de datos personales, a la información, la transparencia y la rendición de cuentas en un gobierno democrático.",
          pdas: {
            "1": "Analiza el derecho a la protección de datos personales y a la transparencia gubernamental.",
            "2": "Analiza el derecho a la protección de datos personales y a la transparencia gubernamental.",
            "3": "Analiza el actuar de los partidos políticos, organizaciones y gobiernos mediante el acceso a la información, transparencia y rendición de cuentas."
          }
        },
        {
          id: "FC16", num: 16,
          titulo: "El derecho a la salud y la prevención en el consumo de drogas.",
          pdas: {
            "1": "Analiza el derecho a la salud y la importancia de la prevención del consumo de drogas.",
            "2": "Analiza el derecho a la salud y la importancia de la prevención del consumo de drogas.",
            "3": "Analiza el derecho a la salud y la importancia de la prevención del consumo de drogas."
          }
        }
      ]
    }
  },

  // ============================================================
  // CAMPO 4: DE LO HUMANO Y LO COMUNITARIO
  // ============================================================
  "De lo humano y lo comunitario": {

    "Tecnología": {
      contenidos: [
        {
          id: "TE01", num: 1,
          titulo: "Herramientas, máquinas e instrumentos, como extensión corporal, en la satisfacción continua de intereses y necesidades humanas.",
          pdas: {
            "1": "Describe los elementos que interactúan en los sistemas técnicos para comprender su vínculo con la sociedad, la cultura y la naturaleza.",
            "2": "Analiza las posibilidades de mejora en las herramientas, máquinas e instrumentos para satisfacer necesidades humanas.",
            "3": "Explora las posibilidades corporales y la delegación de funciones en herramientas, máquinas e instrumentos."
          }
        },
        {
          id: "TE02", num: 2,
          titulo: "Materiales, procesos técnicos y comunidad.",
          pdas: {
            "1": "Identifica los materiales y procesos técnicos utilizados en la comunidad y su impacto social y ambiental.",
            "2": "Analiza los materiales y procesos técnicos utilizados en la comunidad.",
            "3": "Distingue el origen, transformación y características tecnológicas de los materiales que comparten técnicas similares."
          }
        },
        {
          id: "TE03", num: 3,
          titulo: "Usos e implicaciones de la energía en los procesos técnicos.",
          pdas: {
            "1": "Identifica los usos e implicaciones de la energía en los procesos técnicos y su relación con la sustentabilidad.",
            "2": "Analiza los usos e implicaciones de la energía en los procesos técnicos.",
            "3": "Comprende la función de la energía en los sistemas técnicos y sus implicaciones en el desarrollo tecnológico."
          }
        },
        {
          id: "TE04", num: 4,
          titulo: "Factores que inciden en los procesos técnicos.",
          pdas: {
            "1": "Identifica los factores sociales, económicos, culturales y naturales que inciden en los procesos técnicos.",
            "2": "Analiza factores sociales, económicos, culturales y naturales a tomar en cuenta en la definición de criterios para el desarrollo de soluciones técnicas.",
            "3": "Analiza los factores que inciden en los procesos técnicos en su comunidad."
          }
        },
        {
          id: "TE05", num: 5,
          titulo: "Procesos técnicos.",
          pdas: {
            "1": "Describe los elementos que interactúan en los sistemas técnicos artesanales, industriales y automatizados.",
            "2": "Analiza los diferentes sistemas técnicos: artesanales, industriales y automatizados.",
            "3": "Analiza necesidades del entorno cercano para plantear un problema, investigar alternativas de solución y seleccionar la más adecuada."
          }
        },
        {
          id: "TE06", num: 6,
          titulo: "Comunicación y representación técnica.",
          pdas: {
            "1": "Elabora representaciones gráficas de ideas relacionadas con sistemas técnicos.",
            "2": "Elabora representaciones gráficas de sus ideas con respecto a la operación, funcionamiento y diseño de las producciones técnicas.",
            "3": "Elabora representaciones gráficas y comunicaciones técnicas de proyectos de solución."
          }
        },
        {
          id: "TE07", num: 7,
          titulo: "Pensamiento estratégico y creativo en la resolución de problemas.",
          pdas: {
            "1": "Aplica el pensamiento estratégico y creativo para proponer soluciones técnicas a problemas de la comunidad.",
            "2": "Aplica el pensamiento estratégico y creativo para proponer soluciones técnicas.",
            "3": "Analiza necesidades del entorno cercano para plantear un problema, investigar alternativas de solución y seleccionar la que mejor se adapte."
          }
        },
        {
          id: "TE08", num: 8,
          titulo: "Evaluación de sistemas tecnológicos.",
          pdas: {
            "1": "Comprende la importancia de la evaluación de los procesos como parte de la innovación y mejora continua.",
            "2": "Comprende la importancia de la evaluación de los procesos como parte de la innovación y mejora continua para el logro de la eficiencia.",
            "3": "Evalúa sistemas tecnológicos considerando criterios de eficiencia, eficacia, fiabilidad y factibilidad."
          }
        }
      ]
    },

    "Tutoría": {
      contenidos: [
        {
          id: "TU01", num: 1,
          titulo: "Formas de ser, pensar, actuar y relacionarse.",
          pdas: {
            "1": "Reconoce ideas, gustos, necesidades, posibilidades, intereses, deseos y experiencias, para favorecer el autoconocimiento.",
            "2": "Analiza las formas de ser, pensar, actuar e interactuar, para comprender las diversas maneras de vivenciar situaciones cotidianas.",
            "3": "Reconoce ideas, gustos, necesidades, posibilidades, intereses, deseos y experiencias para favorecer el autoconocimiento y descubrimiento de nuevas potencialidades."
          }
        },
        {
          id: "TU02", num: 2,
          titulo: "Los sentimientos y su influencia en la toma de decisiones.",
          pdas: {
            "1": "Distingue entre emociones, estados de ánimo y sentimientos como elementos que contribuyen a la construcción de relaciones afectivas inclusivas y equitativas.",
            "2": "Reflexiona sobre cómo los sentimientos se construyen a partir de ideas y experiencias, para la toma de decisiones asertivas.",
            "3": "Reflexiona sobre cómo los sentimientos influyen en la toma de decisiones personales y colectivas."
          }
        },
        {
          id: "TU03", num: 3,
          titulo: "Construcción del proyecto de vida.",
          pdas: {
            "1": "Reconoce cambios presentes a lo largo de la vida y en la adolescencia para definir metas personales y en colectivo.",
            "2": "Analiza intereses y necesidades, así como logros y metas personales y compartidas para proponer ideas acerca de un proyecto de vida personal.",
            "3": "Valora metas individuales y de otras personas a partir de identificar situaciones y formas de actuar que las afectan, para favorecer su logro y el bienestar colectivo."
          }
        },
        {
          id: "TU04", num: 4,
          titulo: "Prevención de situaciones de riesgo.",
          pdas: {
            "1": "Incorpora prácticas que inciden en la prevención de situaciones de riesgo ante accidentes, adicciones, formas de violencia y fenómenos naturales.",
            "2": "Incorpora prácticas que inciden en la prevención de situaciones de riesgo.",
            "3": "Incorpora prácticas que inciden en la prevención de situaciones de riesgo ante accidentes, adicciones, formas de violencia y fenómenos naturales, para favorecer el desarrollo personal, familiar y comunitario."
          }
        },
        {
          id: "TU05", num: 5,
          titulo: "Educación integral en sexualidad.",
          pdas: {
            "1": "Reconoce que los sentimientos son resultado de las vivencias y la cultura, en el contexto de la educación integral en sexualidad.",
            "2": "Valora la identidad y la diversidad de formas de expresión de género para comprender la manera en que favorece la interacción con las personas y el desarrollo integral.",
            "3": "Identifica las dimensiones de la sexualidad: biológica, psicológica, social, cultural, entre otras, en distintos momentos de su vida, para establecer relaciones en favor del bienestar."
          }
        }
      ]
    },

    "Educación Física": {
      contenidos: [
        {
          id: "EF01", num: 1,
          titulo: "Capacidades, habilidades y destrezas motrices.",
          pdas: {
            "1": "Pone en práctica capacidades, habilidades y destrezas motrices en actividades físicas y deportivas.",
            "2": "Integra sus capacidades, habilidades y destrezas motrices para poner a prueba el potencial individual y de conjunto.",
            "3": "Pone en práctica los elementos de su condición física en actividades motrices y recreativas, para reconocerlas como alternativas que fomentan el bienestar individual y colectivo."
          }
        },
        {
          id: "EF02", num: 2,
          titulo: "Potencialidades cognitivas, expresivas, motrices, creativas y de relación.",
          pdas: {
            "1": "Pone en práctica los elementos de la condición física en actividades motrices y recreativas, para reconocerlas como alternativas que fomentan el bienestar individual y colectivo.",
            "2": "Pone en práctica los elementos de la condición física en actividades motrices y recreativas.",
            "3": "Pone en práctica los elementos de su condición física en actividades motrices y recreativas."
          }
        },
        {
          id: "EF03", num: 3,
          titulo: "Estilos de vida activos y saludables.",
          pdas: {
            "1": "Practica estilos de vida activos y saludables en su vida cotidiana.",
            "2": "Practica estilos de vida activos y saludables.",
            "3": "Implementa acciones que le permiten mantenerse físicamente activo en diferentes momentos del día, para favorecer la práctica de estilos de vida saludables."
          }
        },
        {
          id: "EF04", num: 4,
          titulo: "Pensamiento lúdico, estratégico y creativo.",
          pdas: {
            "1": "Toma decisiones individuales y colectivas en situaciones de juego (defensivas u ofensivas), con el propósito de valorar su efectividad.",
            "2": "Toma decisiones individuales y colectivas en situaciones de juego.",
            "3": "Toma decisiones individuales y colectivas en situaciones de juego, con el propósito de valorar su efectividad."
          }
        },
        {
          id: "EF05", num: 5,
          titulo: "Interacción motriz.",
          pdas: {
            "1": "Pone a prueba la interacción motriz en situaciones de juego, iniciación deportiva y deporte educativo, con el fin de alcanzar metas comunes.",
            "2": "Pone a prueba la interacción motriz en situaciones de juego y deporte educativo.",
            "3": "Pone a prueba la interacción motriz en situaciones de juego y deporte educativo."
          }
        }
      ]
    }
  }
};

// ============================================================
// MAPEO DE CAMPOS Y DISCIPLINAS POR GRADO
// ============================================================
const CAMPOS_POR_GRADO = {
  "1": {
    "Lenguajes": ["Español", "Inglés", "Artes"],
    "Saberes y pensamiento científico": ["Matemáticas", "Biología"],
    "Ética, naturaleza y sociedades": ["Historia", "Geografía", "Formación Cívica y Ética"],
    "De lo humano y lo comunitario": ["Tecnología", "Tutoría", "Educación Física"]
  },
  "2": {
    "Lenguajes": ["Español", "Inglés", "Artes"],
    "Saberes y pensamiento científico": ["Matemáticas", "Física"],
    "Ética, naturaleza y sociedades": ["Historia", "Formación Cívica y Ética"],
    "De lo humano y lo comunitario": ["Tecnología", "Tutoría", "Educación Física"]
  },
  "3": {
    "Lenguajes": ["Español", "Inglés", "Artes"],
    "Saberes y pensamiento científico": ["Matemáticas", "Química"],
    "Ética, naturaleza y sociedades": ["Historia", "Formación Cívica y Ética"],
    "De lo humano y lo comunitario": ["Tecnología", "Tutoría", "Educación Física"]
  }
};

// ============================================================
// TIPO DE PROYECTO POR CAMPO FORMATIVO
// ============================================================
const TIPOS_PROYECTO = {
  "Lenguajes": ["Proyecto comunitario", "Proyecto de aula", "Proyecto escolar", "Secuencia didáctica"],
  "Saberes y pensamiento científico": ["Proyecto de aula", "Aprendizaje basado en problemas", "Secuencia didáctica", "Proyecto comunitario"],
  "Ética, naturaleza y sociedades": ["Proyecto comunitario", "Proyecto escolar", "Secuencia didáctica", "Aprendizaje basado en problemas"],
  "De lo humano y lo comunitario": ["Proyecto comunitario", "Proyecto de aula", "Secuencia didáctica", "Aprendizaje servicio"]
};

// ============================================================
// EJES ARTICULADORES
// ============================================================
const EJES_ARTICULADORES = [
  "Inclusión",
  "Pensamiento crítico",
  "Interculturalidad crítica",
  "Igualdad de género",
  "Vida saludable",
  "Apropiación de las culturas a través de la lectura y la escritura",
  "Artes y experiencias estéticas"
];

// ============================================================
// PERFIL DE EGRESO (fragmentos clave)
// ============================================================
const PERFIL_EGRESO = [
  "1. Reconocen que son ciudadanas y ciudadanos que pueden ejercer su derecho a una vida digna, a decidir sobre su cuerpo, a construir su identidad personal y colectiva, así como a vivir con bienestar y buen trato.",
  "2. Viven, reconocen y valoran la diversidad étnica, cultural, lingüística, sexual, política, social y de género del país como rasgos que caracterizan a la nación mexicana.",
  "3. Reconocen que mujeres y hombres son personas que gozan de los mismos derechos, con capacidad de acción, autonomía, decisión para vivir una vida digna, libre de violencia y discriminación.",
  "4. Valoran sus potencialidades cognitivas, físicas y afectivas a partir de las cuales pueden mejorar sus capacidades personales y de la comunidad durante las distintas etapas de su vida.",
  "5. Desarrollan una forma de pensar propia que emplean para analizar y hacer juicios argumentados sobre su realidad familiar, escolar, comunitaria, nacional y mundial.",
  "6. Se perciben a sí mismas y a sí mismos como parte de la naturaleza, conscientes del momento que viven en su ciclo de vida y la importancia de relacionar el cuidado de su alimentación, su salud física, mental, sexual y reproductiva con la salud planetaria desde una visión sustentable.",
  "7. Interpretan fenómenos, hechos y situaciones históricas, culturales, naturales y sociales a partir de temas diversos e indagan para explicarlos con base en razonamientos, modelos, datos e información con fundamentos científicos y saberes comunitarios.",
  "8. Interactúan en procesos de diálogo con respeto y aprecio a la diversidad de capacidades, características, condiciones, necesidades, intereses y visiones al trabajar de manera cooperativa.",
  "9. Intercambian ideas, cosmovisiones y perspectivas mediante distintos lenguajes, con el fin de establecer acuerdos en los que se respeten las ideas propias y las de otras y otros. Aprovechan los recursos y medios de la cultura digital, de manera ética y responsable.",
  "10. Desarrollan el pensamiento crítico que les permita valorar los conocimientos y saberes de las ciencias y humanidades, reconociendo la importancia que tienen la historia y la cultura para examinar críticamente sus propias ideas."
];

// ============================================================
// FUNCIÓN AUXILIAR: obtener contenidos por grado y disciplina
// ============================================================
function obtenerContenidos(campo, disciplina, grado) {
  const data = CURRICULUM[campo]?.[disciplina];
  if (!data) return [];

  return data.contenidos.filter(c => {
    // Si el contenido tiene PDAs para ese grado
    if (c.pdas[grado] && c.pdas[grado] !== "N/A") return true;
    // Si no tiene grado específico, incluir para todos
    if (!data.grado) return true;
    // Si tiene grado específico, solo ese grado
    return data.grado === grado;
  });
}

function obtenerPDA(contenido, grado) {
  return contenido.pdas[grado] || contenido.pdas["1"] || "";
}

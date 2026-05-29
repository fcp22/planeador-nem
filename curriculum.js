// ============================================================
// BASE CURRICULAR NEM - FASE 6 - SECUNDARIA
// Programa Sintético - Acuerdo 08/08/23
// Campos Formativos, Disciplinas, Contenidos y PDAs
// ============================================================

const CURRICULUM = {

  // ============================================================
  // CAMPO 1: LENGUAJES
  // Fuente: Programa Sintético Fase 6, SEP 2022 — páginas 33-56
  // ============================================================
  "Lenguajes": {

    "Español": {
      contenidos: [
        {
          id: "ES01", num: 1,
          titulo: "La diversidad de lenguas y su uso en la comunicación familiar, escolar y comunitaria.",
          pdas: {
            "1": "Reconoce la riqueza lingüística de México y el mundo, a partir de obras literarias procedentes de distintas culturas.",
            "2": "Comprende las características y recursos lingüísticos de la lengua española, para usarlos y valorarlos como parte de la riqueza pluricultural de México y del mundo.",
            "3": "Analiza y reconoce algunas variantes lingüísticas de la lengua española, para valorarla como riqueza cultural."
          }
        },
        {
          id: "ES02", num: 2,
          titulo: "La diversidad étnica, cultural y lingüística de México a favor de una sociedad intercultural.",
          pdas: {
            "1": "Comprende las ideas centrales y secundarias de textos relacionados con la diversidad étnica, cultural y lingüística, que favorecen una sociedad intercultural, para comentarlas en forma oral y escrita.",
            "2": "Compara y contrasta textos sobre las tensiones y conflictos en las sociedades contemporáneas y manifiesta, de manera oral o escrita, la necesidad de practicar la comunicación asertiva. Analiza textos sobre las sociedades multiculturales y expresa la función que tiene el diálogo intercultural para la construcción democrática y la interacción en sociedad.",
            "3": "Practica la comunicación asertiva y el diálogo intercultural en interacción con otras personas. Comparte una propuesta creativa propia en la que valore y promueva textos en español a favor de una sociedad intercultural."
          }
        },
        {
          id: "ES03", num: 3,
          titulo: "Las lenguas como manifestación de la identidad y del sentido de pertenencia.",
          pdas: {
            "1": "Describe en un texto cómo el lenguaje oral manifiesta las identidades personal y colectiva, para reconocer lo común y lo diferente.",
            "2": "Comprende y redacta textos narrativos sobre la construcción de la identidad y el sentido de pertenencia, a partir del análisis de variantes del español.",
            "3": "Elabora textos argumentativos acerca de la interculturalidad crítica, para reconocer el valor de las lenguas, a fin de promoverlas y fortalecerlas."
          }
        },
        {
          id: "ES04", num: 4,
          titulo: "El dinamismo de las lenguas y su relevancia como patrimonio cultural.",
          pdas: {
            "1": "Identifica y expresa la relevancia de valorar las lenguas como legado de la comunidad.",
            "2": "Reconoce cambios temporales y geográficos del español en la comunidad, el país o el mundo hispano.",
            "3": "Analiza en textos literarios neologismos, juegos de lenguajes, caló, jerga, préstamos lingüísticos y extranjerismos como parte del dinamismo de la lengua española."
          }
        },
        {
          id: "ES05", num: 5,
          titulo: "La función creativa del español en la expresión de necesidades e intereses comunitarios.",
          pdas: {
            "1": "Identifica una situación problemática de la comunidad, haciendo uso del pensamiento crítico, para plantear diversas formas creativas de resolverla, por ejemplo, con un cuento.",
            "2": "Expresa, mediante un ensayo, una postura crítica sobre necesidades, intereses y problemas de la comunidad.",
            "3": "Crea textos literarios de distintos géneros para ofrecer una propuesta de solución a problemas de la comunidad."
          }
        },
        {
          id: "ES06", num: 6,
          titulo: "Los elementos y los recursos estéticos de la lengua española en la literatura oral y escrita.",
          pdas: {
            "1": "Reconoce los recursos estéticos en textos literarios líricos, orales y escritos, y disfruta de poemas, canciones y juegos de palabras, entre otros.",
            "2": "Analiza las características y recursos estéticos de los textos narrativos, e interpreta y disfruta de cuentos y novelas.",
            "3": "Usa creativa e intencionalmente las características y los recursos estéticos de textos dramáticos, para escenificar situaciones vinculadas con la comunidad."
          }
        },
        {
          id: "ES07", num: 7,
          titulo: "Textos literarios escritos en español o traducidos.",
          pdas: {
            "1": "Reconoce el valor estético de diversos géneros literarios en textos de su elección, para elaborar comentarios y promover su lectura.",
            "2": "Analiza diversos textos literarios de su elección para expresar un juicio estético y lo comparte en la comunidad.",
            "3": "Elabora un ensayo acerca del tratamiento de un tema de su elección, con base en algún género literario de su preferencia, para argumentar un juicio estético sobre éste."
          }
        },
        {
          id: "ES08", num: 8,
          titulo: "Creaciones literarias tradicionales y contemporáneas.",
          pdas: {
            "1": "Recupera y clasifica creaciones literarias de la comunidad o de un lugar de interés, como mitos, leyendas, fábulas, epopeyas, cantares de gesta, refranes, coplas, canciones, corridos y juegos de palabras, para promover de manera creativa su lectura.",
            "2": "Valora textos literarios tradicionales y contemporáneos, como cuentos, novelas, poemas y textos dramáticos; los adapta a otros lenguajes para sensibilizar a la comunidad acerca de la relevancia social y cultural de la literatura.",
            "3": "Crea textos narrativos, poéticos, dramáticos y guiones para audiovisuales, entre otros, a partir del uso de recursos literarios, para exponer una situación real o ficticia."
          }
        },
        {
          id: "ES09", num: 9,
          titulo: "Recursos literarios en lengua española para expresar sensaciones, emociones, sentimientos e ideas vinculados con las familias, la escuela y la comunidad.",
          pdas: {
            "1": "Identifica recursos literarios en lengua española y los emplea en la elaboración de cartas personales y biografías, para expresar sensaciones, emociones, sentimientos e ideas que experimenta en su entorno familiar, escolar o comunitario.",
            "2": "Analiza recursos literarios en lengua española para expresar sensaciones, emociones, sentimientos e ideas al elaborar una autobiografía con respecto a los vínculos consigo mismo y con el entorno familiar, escolar o comunitario.",
            "3": "Recupera recursos literarios de la lengua española para crear un texto libre que describa los vínculos con el entorno familiar, escolar o comunitario."
          }
        },
        {
          id: "ES10", num: 10,
          titulo: "Los géneros periodísticos y sus recursos para comunicar sucesos significativos familiares, escolares, comunitarios y sociales.",
          pdas: {
            "1": "Identifica sucesos significativos familiares, escolares, comunitarios y sociales que forman parte de la memoria colectiva y los comunica haciendo uso de las características de los géneros periodísticos informativos.",
            "2": "Investiga un evento familiar, escolar o comunitario significativo de la memoria colectiva, para comunicarlo utilizando las características de los géneros periodísticos de opinión.",
            "3": "Analiza los sucesos más significativos de la comunidad y los comunica empleando las características de los géneros periodísticos de interpretación, para preservar la memoria colectiva."
          }
        },
        {
          id: "ES11", num: 11,
          titulo: "Comunicación asertiva y dialógica para erradicar expresiones de violencia.",
          pdas: {
            "1": "Realiza, de manera colectiva, una propuesta oral o por escrito, para promover acciones que posibiliten erradicar la violencia en las familias y la escuela. Elabora solicitudes de gestión de espacios y recursos para dar a conocer la propuesta.",
            "2": "Participa en un debate acerca de algunas expresiones de violencia —como la de género y la sexual— para argumentar una postura de rechazo. Elabora invitaciones a expertos y redacta oficios de gestión para obtener recursos y espacios donde tendrá lugar el encuentro.",
            "3": "Discute de forma colectiva y diseña una estrategia sobre la importancia de sensibilizar a la comunidad acerca de la violencia. Redacta un texto informativo acerca de la importancia de erradicar la violencia y realiza de manera formal las gestiones necesarias para compartirlo con la comunidad."
          }
        },
        {
          id: "ES12", num: 12,
          titulo: "Mensajes para promover una vida saludable, expresados en medios comunitarios o masivos de comunicación.",
          pdas: {
            "1": "Identifica las características y recursos de mensajes que promueven una vida saludable a través de los diferentes medios comunitarios o masivos de comunicación impresos o audiovisuales.",
            "2": "Elabora un mensaje impreso empleando imágenes, textos, colores y otros recursos gráficos, para favorecer una vida saludable, y lo comparte en la comunidad.",
            "3": "Construye narrativas acerca de una vida saludable, haciendo uso del lenguaje audiovisual y las transmite por medios comunitarios o masivos de comunicación."
          }
        },
        {
          id: "ES13", num: 13,
          titulo: "Textos de divulgación científica.",
          pdas: {
            "1": "Identifica las características del texto de divulgación científica y elabora uno.",
            "2": "Analiza las características del texto de divulgación científica, para elaborar y dar a conocer diversos textos científicos orales o escritos que traten sobre un tema de interés personal o colectivo.",
            "3": "Elabora una propuesta de divulgación científica, con la participación de la comunidad escolar, para fomentar el conocimiento de las ciencias."
          }
        },
        {
          id: "ES14", num: 14,
          titulo: "Manifestaciones culturales y artísticas que favorecen una sociedad incluyente.",
          pdas: {
            "1": "Reconoce manifestaciones culturales y artísticas creadas o ejecutadas por personas con alguna discapacidad, para distinguir sus valores estéticos y creativos y las comparte en forma oral o escrita con la comunidad.",
            "2": "Elabora un texto oral o escrito acerca de las manifestaciones culturales y artísticas que promuevan una sociedad incluyente.",
            "3": "Crea un texto literario que aborde un tema que promueva una sociedad incluyente."
          }
        },
      ]
    },

    "Inglés": {
      contenidos: [
        {
          id: "IN01", num: 1,
          titulo: "La diversidad lingüística y sus formas de expresión en México y el mundo.",
          pdas: {
            "1": "Hace uso del alfabeto, los números y las expresiones básicas en inglés, para nombrar y recuperar datos factuales y características básicas de lenguas reconocidas en México y el mundo.",
            "2": "Comprende textos narrativos y biográficos en inglés sobre la vida cotidiana, formas de interacción y comportamiento de hablantes de diversas lenguas de México y el mundo en el pasado, y lo expresa en organizadores gráficos, infografías u otras formas de presentación escrita y oral.",
            "3": "Utiliza diversos tipos de texto y medios de comunicación para expresar y difundir en inglés prácticas culturales y lingüísticas diversas de sociedades en México y el mundo."
          }
        },
        {
          id: "IN02", num: 2,
          titulo: "La identidad y cultura de pueblos de habla inglesa.",
          pdas: {
            "1": "Recupera información para llevar a cabo presentaciones en inglés, orales y escritas, que describan rasgos étnicos, culturales e identitarios de hablantes de lengua inglesa.",
            "2": "Elabora fichas informativas en inglés sobre rasgos identitarios de pueblos de habla inglesa (acento, grafía, vestimenta, comida, tradiciones, costumbres, entre otros).",
            "3": "Construye una propuesta de comunicación en inglés, oral y escrita, donde contraste, valore y promueva rasgos de una sociedad intercultural identificados en pueblos de habla inglesa."
          }
        },
        {
          id: "IN03", num: 3,
          titulo: "Las manifestaciones culturales, lingüísticas y artísticas en inglés a favor de la interculturalidad.",
          pdas: {
            "1": "Elabora un cómic o manga en inglés donde se rescata la importancia de la interculturalidad.",
            "2": "Interpreta juegos de roles en inglés sobre situaciones que favorezcan la comunicación asertiva.",
            "3": "Elabora guiones en inglés que aborden situaciones de conflicto resueltas mediante la comunicación asertiva e intercultural, y los dramatiza."
          }
        },
        {
          id: "IN04", num: 4,
          titulo: "Uso de diversos textos en inglés que promueven la preservación y conservación de las lenguas.",
          pdas: {
            "1": "Recupera estrategias acerca de la conservación y preservación de las lenguas, planteadas en textos informativos y científicos en inglés, y las difunde.",
            "2": "Indaga y construye propuestas en inglés para conservar y preservar las lenguas, como legado y sentido de pertenencia, y las difunde por algún medio de comunicación.",
            "3": "Participa en un debate en inglés sobre los cambios lingüísticos y culturales de las lenguas en el transcurso del tiempo, y su impacto en la conformación de nuevas prácticas sociales."
          }
        },
        {
          id: "IN05", num: 5,
          titulo: "El uso del inglés para expresar necesidades, intereses y problemas de la comunidad.",
          pdas: {
            "1": "Investiga en textos en inglés soluciones implementadas sobre problemas de una comunidad, e informa de manera oral o escrita sus hallazgos.",
            "2": "Elabora escritos argumentativos en inglés sobre acciones colectivas que posibiliten la solución de problemas de una comunidad.",
            "3": "Organiza una campaña en inglés sobre soluciones a problemas de la comunidad."
          }
        },
        {
          id: "IN06", num: 6,
          titulo: "Elementos y recursos estéticos del inglés.",
          pdas: {
            "1": "Recupera de distintos tipos de textos literarios en inglés, expresiones, elementos y recursos estéticos y elabora un glosario.",
            "2": "Identifica y explica el uso de expresiones, elementos y recursos estéticos en manifestaciones culturales y artísticas de países de habla inglesa.",
            "3": "Emplea algunas figuras retóricas, elementos y recursos estéticos, para construir un texto literario corto, oral y escrito, para difundirlo en la comunidad escolar."
          }
        },
        {
          id: "IN07", num: 7,
          titulo: "Manifestaciones artísticas y culturales del inglés.",
          pdas: {
            "1": "Realiza una lectura crítica y emite su opinión en inglés sobre diversas manifestaciones culturales y artísticas de pueblos de habla inglesa.",
            "2": "Selecciona alguna manifestación artística o cultural y la difunde en inglés, mediante diversos elementos y recursos artísticos.",
            "3": "Crea poemas cortos a partir del uso de recursos estéticos del inglés en producciones orales y escritas, para difundirse en la comunidad escolar."
          }
        },
        {
          id: "IN08", num: 8,
          titulo: "Creaciones literarias tradicionales y contemporáneas en inglés.",
          pdas: {
            "1": "Selecciona textos literarios en inglés que aborden temas de la comunidad o de algún lugar de interés, los resume y difunde por distintos medios.",
            "2": "Investiga en textos literarios en inglés sobre pueblos indígenas y/o afrodescendientes de México o el mundo. Elabora por escrito una apreciación sobre la relevancia y el valor social y cultural de los pueblos indígenas y/o afrodescendientes de México o el mundo.",
            "3": "Crea textos breves en inglés para exponer una situación o tema de interés, con recursos narrativos, poéticos, visuales, escénicos o musicales."
          }
        },
        {
          id: "IN09", num: 9,
          titulo: "El inglés para expresar sensaciones, emociones, sentimientos e ideas vinculados con las familias, la escuela y la comunidad.",
          pdas: {
            "1": "Lleva a cabo juegos del lenguaje en inglés para expresar sensaciones, emociones, sentimientos e ideas sobre las familias y la escuela.",
            "2": "Realiza entrevistas en inglés para recuperar opiniones acerca de emociones, sentimientos e ideas sobre la escuela y la comunidad.",
            "3": "Investiga y recupera manifestaciones culturales y artísticas de su comunidad, para difundirlas en inglés."
          }
        },
        {
          id: "IN10", num: 10,
          titulo: "Relatos en inglés para expresar sucesos significativos familiares, escolares, comunitarios y sociales.",
          pdas: {
            "1": "Entrevista y narra en inglés sucesos significativos familiares, escolares, comunitarios o sociales recuperados de la memoria colectiva.",
            "2": "Investiga un acontecimiento familiar, escolar o comunitario significativo, recuperado de la memoria colectiva, para redactar una reflexión en inglés.",
            "3": "Recupera un acontecimiento histórico comunitario y elabora un texto oral y escrito en inglés, para expresar su postura, haciendo uso de recursos visuales o auditivos."
          }
        },
        {
          id: "IN11", num: 11,
          titulo: "Comunicación asertiva y dialógica en inglés, para sensibilizar sobre la erradicación de la violencia en las familias y la escuela.",
          pdas: {
            "1": "Recupera de distintos textos en inglés, expresiones de violencia presentes en las familias y las escuelas. Reflexiona y comunica de forma oral y escrita una postura de rechazo a la violencia, mediante la comunicación asertiva y dialógica.",
            "2": "Participa en un panel o debate en inglés, sobre la importancia de la comunicación asertiva y dialógica, a fin de consensuar propuestas de acción para sensibilizar sobre la erradicación de la violencia en las familias y la escuela.",
            "3": "Diseña y difunde en inglés propuestas escritas para sensibilizar a la comunidad acerca de la importancia de erradicar la violencia."
          }
        },
        {
          id: "IN12", num: 12,
          titulo: "Mensajes en inglés en medios de comunicación masiva, que promuevan una vida saludable.",
          pdas: {
            "1": "Recupera en inglés mensajes que promueven una vida saludable y los difunde de manera oral o escrita, a través de distintos medios de comunicación.",
            "2": "Investiga en diversas fuentes en inglés sobre una vida saludable, para construir un texto informativo y difundirlo a través de medios de comunicación.",
            "3": "Cuenta historias en inglés sobre ejemplos de vida saludable y las difunde mediante el uso de medios de comunicación, para sensibilizar a la comunidad."
          }
        },
        {
          id: "IN13", num: 13,
          titulo: "El uso del inglés en la construcción de mensajes a favor de la inclusión.",
          pdas: {
            "1": "Investiga en diversas fuentes en inglés las características de los mensajes que presentan información a favor de la interacción, sensibilización y empatía con la diversidad y expone su punto de vista.",
            "2": "Analiza las características y recursos empleados en la comunicación asertiva en inglés, y sugiere su uso para favorecer una sociedad incluyente.",
            "3": "Construye un proyecto en inglés para valorar la diversidad y fomentar la inclusión social en su entorno."
          }
        },
        {
          id: "IN14", num: 14,
          titulo: "El uso del inglés en las manifestaciones culturales y artísticas que favorecen la construcción de una sociedad incluyente.",
          pdas: {
            "1": "Elabora semblanzas en inglés sobre personas en condición de discapacidad, destacadas por contribuir a la cultura, las artes y las difunde.",
            "2": "Investiga, reflexiona y expone en inglés acerca de los sistemas alternativos y aumentativos que favorecen el tránsito a una sociedad incluyente.",
            "3": "Crea en inglés alguna manifestación artística que aborde cómo los sistemas alternativos y aumentativos favorecen sociedades incluyentes."
          }
        },
      ]
    },

    "Artes": {
      contenidos: [
        {
          id: "AR01", num: 1,
          titulo: "Diversidad de lenguajes artísticos en la riqueza pluricultural de México y del mundo.",
          pdas: {
            "1": "Reconoce en manifestaciones artísticas de México y el mundo el uso del cuerpo, del espacio y del tiempo, para valorarlas como parte de la riqueza pluricultural.",
            "2": "Explora la creación de secuencias y patrones al identificar el uso de formas, colores, movimientos y sonidos, entre otros elementos de las artes, en manifestaciones artísticas de México y del mundo, para apreciar la riqueza pluricultural.",
            "3": "Experimenta con características de algunos estilos de los lenguajes artísticos, para representar la riqueza pluricultural de México y del mundo."
          }
        },
        {
          id: "AR02", num: 2,
          titulo: "Manifestaciones culturales y artísticas que conforman la diversidad étnica, cultural y lingüística.",
          pdas: {
            "1": "Identifica diferentes manifestaciones culturales y artísticas de pueblos indígenas y afrodescendientes de México y del mundo, para interpretar significados que permitan fomentar una sociedad intercultural.",
            "2": "Compara el uso de formas, colores, movimientos y sonidos, entre otros elementos de las artes, en manifestaciones culturales y artísticas de diferentes épocas y orígenes culturales, para fomentar una sociedad intercultural.",
            "3": "Presenta una propuesta creativa, usando intencionalmente el cuerpo, espacio y tiempo, entre otros elementos de las artes, para valorar y promover la diversidad étnica, cultural y lingüística, a favor de una sociedad intercultural."
          }
        },
        {
          id: "AR03", num: 3,
          titulo: "Identidad y sentido de pertenencia en manifestaciones artísticas.",
          pdas: {
            "1": "Aprecia la intención expresiva en diversas manifestaciones artísticas, para la construcción crítica de las identidades personal y colectiva.",
            "2": "Reflexiona sobre la manera en que las artes fortalecen la identidad, dan sentido de pertenencia y resultan esenciales para favorecer la interculturalidad crítica.",
            "3": "Crea propuestas artísticas utilizando intencionalmente características de algunos estilos artísticos, a favor de la interculturalidad crítica, para fortalecer las identidades personal y colectiva."
          }
        },
        {
          id: "AR04", num: 4,
          titulo: "Patrimonio cultural de la comunidad en manifestaciones artísticas que fomentan la identidad y el sentido de pertenencia.",
          pdas: {
            "1": "Interpreta manifestaciones artísticas del patrimonio cultural de la comunidad y de México, para fomentar las identidades personal y colectiva, así como el sentido de pertenencia.",
            "2": "Expresa, mediante lenguajes artísticos, la relevancia de valorar, conservar y preservar el patrimonio cultural, como legado que le otorga identidad y sentido de pertenencia.",
            "3": "Reinterpreta de manera respetuosa manifestaciones artísticas del patrimonio cultural, para valorar su identidad y sentido de pertenencia."
          }
        },
        {
          id: "AR05", num: 5,
          titulo: "Los lenguajes artísticos en la expresión de problemas de la comunidad.",
          pdas: {
            "1": "Usa intencionalmente formas, colores, movimientos y sonidos, entre otros elementos de las artes, para recrear una situación problemática de su contexto y manifestar una postura crítica.",
            "2": "Investiga propuestas artísticas colectivas de entornos rurales y urbanos a favor de la inclusión, para presentar una postura crítica sobre un problema de la comunidad.",
            "3": "Experimenta con técnicas artísticas y elige una que implemente en un proyecto escolar creativo, para imaginar y proponer posibles soluciones a problemas de la comunidad."
          }
        },
        {
          id: "AR06", num: 6,
          titulo: "Elementos de las artes y recursos estéticos apreciados en el entorno natural y social, así como en diversas manifestaciones artísticas.",
          pdas: {
            "1": "Identifica el uso intencional del cuerpo, del espacio y del tiempo en manifestaciones artísticas, para apreciar e interpretar sus sentidos y significados. Percibe cualidades estéticas en el entorno natural y social, para interpretar sus sentidos y significados.",
            "2": "Analiza el uso intencional de elementos de las artes y recursos estéticos como ritmo, repetición, armonía, contraste y variación, en manifestaciones artísticas, para emplearlos en una creación personal. Reinterpreta los sentidos y significados de las cualidades estéticas del entorno natural y social en creaciones artísticas personales.",
            "3": "Usa intencionalmente figuras retóricas como metáforas, hipérboles, sinécdoques, aliteraciones, en creaciones artísticas colectivas, para representar situaciones vinculadas a la comunidad. Interviene el entorno natural y social, mediante el uso de los lenguajes artísticos, para expresar un mensaje a favor del cuidado del medioambiente."
          }
        },
        {
          id: "AR07", num: 7,
          titulo: "Valor estético de la naturaleza, de la vida cotidiana y de diferentes manifestaciones culturales y artísticas.",
          pdas: {
            "1": "Disfruta de manifestaciones culturales y artísticas de la comunidad y de otros lugares, para reconocer sus gustos e intereses estéticos. Disfruta los valores estéticos presentes en la naturaleza para apreciarla y expresarla.",
            "2": "Investiga diversas manifestaciones culturales y artísticas para expresar un juicio estético y lo difunde en la comunidad escolar. Emite un juicio estético sobre un episodio significativo de la vida cotidiana y lo difunde en la comunidad escolar.",
            "3": "Identifica algunas categorías estéticas como lo bello, lo sublime, lo grotesco, lo trágico, lo cómico y lo siniestro, al apreciarlas en manifestaciones culturales y artísticas, para argumentar sus juicios estéticos y difundirlos en la comunidad. Identifica algunas categorías estéticas como lo bello, lo sublime, lo grotesco, lo trágico, lo cómico y lo siniestro, al apreciarlas en la naturaleza y en la vida cotidiana, para compartir sus juicios estéticos y difundirlos en la comunidad."
          }
        },
        {
          id: "AR08", num: 8,
          titulo: "Creaciones artísticas que tienen su origen en textos literarios.",
          pdas: {
            "1": "Explora con formas, colores, movimientos, sonidos, entre otros elementos de las artes, para reinterpretar textos literarios de la comunidad u otros lugares, haciendo uso de diversos lenguajes artísticos.",
            "2": "Adapta textos literarios provenientes de culturas indígenas o afrodescendientes, experimentando con elementos de las artes y recursos estéticos como la repetición, ritmo, armonía, contraste y variación, para sensibilizar a la comunidad sobre las formas de expresión de los pueblos originarios.",
            "3": "Construye una narrativa personal o colectiva, a partir de un texto literario de su interés, empleando en forma artística cuerpo, espacio y tiempo."
          }
        },
        {
          id: "AR09", num: 9,
          titulo: "Expresión artística de sensaciones, emociones, sentimientos e ideas, a partir de experiencias familiares, escolares o comunitarias.",
          pdas: {
            "1": "Recrea lúdicamente sensaciones, emociones, sentimientos e ideas, mediante el uso del cuerpo, del espacio y del tiempo, para expresar la relación con su entorno familiar.",
            "2": "Explora con técnicas artísticas y elige una para apreciar, simbolizar y compartir sensaciones, emociones, sentimientos e ideas relacionados con el entorno escolar.",
            "3": "Usa intencionalmente características y funciones de algunos géneros artísticos, para crear una obra original que simbolice sus vínculos con la comunidad."
          }
        },
        {
          id: "AR10", num: 10,
          titulo: "Memoria colectiva representada por medios artísticos, para registrar experiencias comunitarias.",
          pdas: {
            "1": "Recupera de la memoria colectiva acontecimientos significativos de las familias, escuela o comunidad, para representarlos de manera creativa.",
            "2": "Reinterpreta, mediante características de algunos géneros artísticos, un acontecimiento familiar, escolar o comunitario significativo de la memoria colectiva.",
            "3": "Manifiesta una postura crítica sobre la memoria colectiva, acerca de un acontecimiento relevante para la comunidad, al hacer uso de los lenguajes artísticos."
          }
        },
        {
          id: "AR11", num: 11,
          titulo: "Procesos creativos que ponen en práctica la comunicación dialógica, como estrategia para erradicar expresiones de violencia.",
          pdas: {
            "1": "Expresa, mediante elementos de las artes como las formas, colores, movimientos y sonidos, la relevancia del diálogo como una alternativa a las manifestaciones de violencia presentes en la familia, escuela y comunidad.",
            "2": "Imagina y comparte propuestas artísticas de acción para contribuir en la erradicación de la violencia en la familia, escuela y comunidad, haciendo uso de una comunicación abierta, respetuosa y empática con la diversidad.",
            "3": "Presenta al público una propuesta artística respetuosa y empática con la diversidad, a fin de sensibilizar a la comunidad acerca de la importancia del diálogo para erradicar la violencia en el entorno."
          }
        },
        {
          id: "AR12", num: 12,
          titulo: "Vida saludable expresada a través de mensajes construidos con elementos de las artes, para difundirlos por distintos medios de comunicación.",
          pdas: {
            "1": "Emplea intencionalmente formas, colores, movimientos, sonidos, entre otros elementos de las artes, para representar una vida saludable y la difunde por un medio de comunicación escolar.",
            "2": "Crea mensajes que promuevan una vida saludable, utilizando artísticamente formas, colores, movimientos y sonidos, entre otros elementos de las artes, para difundirlos por distintos medios de comunicación.",
            "3": "Construye una narrativa a favor de una vida saludable, mediante el uso artístico de distintos formatos como fotografía, historieta, secuencia corporal, secuencia sonora, entre otros, y la difunde por distintos medios de comunicación."
          }
        },
        {
          id: "AR13", num: 13,
          titulo: "Sistemas alternativos y aumentativos de comunicación, como herramientas creativas que favorecen la inclusión.",
          pdas: {
            "1": "Identifica algunas características sensoriales de la Lengua de Señas Mexicana, el código Braille, los tableros de comunicación y otros sistemas alternativos y aumentativos, para fomentar la interacción, sensibilización y empatía con la diversidad.",
            "2": "Experimenta con sistemas alternativos y aumentativos de comunicación al usar artísticamente el cuerpo, espacio, tiempo, entre otros elementos de las artes, en una propuesta comunitaria que visibilice la diversidad y fomente la inclusión social.",
            "3": "Crea códigos que favorezcan la inclusión, a través del uso artístico de formas, colores, texturas, movimientos, gestos, sonidos, entre otros recursos que incorporen características de los sistemas alternativos y aumentativos."
          }
        },
      ]
    },
  },

  // ============================================================
  // CAMPO 2: SABERES Y PENSAMIENTO CIENTÍFICO
  // Fuente: Programa Sintético Fase 6, SEP 2022 — páginas 58-72
  // ============================================================
  "Saberes y Pensamiento Científico": {

    "Matemáticas": {
      contenidos: [
        {
          id: "MA01", num: 1,
          titulo: "Expresión de fracciones como decimales y de decimales como fracciones.",
          pdas: {
            "1": "Usa diversas estrategias al convertir números fraccionarios a decimales y viceversa.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "MA02", num: 2,
          titulo: "Extensión de los números a positivos y negativos y su orden.",
          pdas: {
            "1": "Reconoce la necesidad de los números negativos a partir de usar cantidades que tienen al cero como referencia. Compara y ordena números con signo (enteros, fracciones y decimales) en la recta numérica y analiza en qué casos se cumple la propiedad de densidad.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "MA03", num: 3,
          titulo: "Extensión del significado de las operaciones y sus relaciones inversas.",
          pdas: {
            "1": "Reconoce el significado de las cuatro operaciones básicas y sus relaciones inversas al resolver problemas que impliquen el uso de números con signo. Comprueba y argumenta si cada una de estas operaciones cumple las propiedades: conmutativa, asociativa y distributiva. Identifica y aplica la jerarquía de operaciones y símbolos de agrupación al realizar cálculos.",
            "2": "Usa criterios de divisibilidad y números primos al resolver problemas que implican calcular el máximo común divisor y el mínimo común múltiplo. Calcula potencias con exponente entero y la raíz cuadrada. Usa la notación científica. Usa la notación científica al realizar cálculos con cantidades muy grandes o muy pequeñas.",
            "3": "N/A"
          }
        },
        {
          id: "MA04", num: 4,
          titulo: "Regularidades y Patrones.",
          pdas: {
            "1": "Representa algebraicamente una sucesión con progresión aritmética de figuras y números.",
            "2": "Representa algebraicamente una sucesión con progresión cuadrática de figuras y números.",
            "3": "N/A"
          }
        },
        {
          id: "MA05", num: 5,
          titulo: "Introducción al álgebra.",
          pdas: {
            "1": "Interpreta y plantea diversas situaciones del lenguaje común al lenguaje algebraico y viceversa. Representa algebraicamente perímetros de figuras.",
            "2": "Representa algebraicamente áreas que generan una expresión cuadrática. Identifica y usa las propiedades de los exponentes al resolver distintas operaciones algebraicas.",
            "3": "Representa algebraicamente áreas y volúmenes de cuerpos geométricos y calcula el valor de una variable en función de las otras."
          }
        },
        {
          id: "MA06", num: 6,
          titulo: "Ecuaciones lineales y cuadráticas.",
          pdas: {
            "1": "Resuelve ecuaciones de la forma Ax=B, Ax+B=C, Ax+B=Cx+D con el uso de las propiedades de la igualdad. Modela y resuelve problemas cuyo planteamiento es una ecuación lineal. Resuelve problemas de porcentajes en diversas situaciones.",
            "2": "Resuelve desigualdades con expresiones algebraicas. Modela y soluciona sistemas de dos ecuaciones lineales con dos incógnitas por algún método para dar respuesta a un problema.",
            "3": "Resuelve ecuaciones de la forma Ax²+Bx+C=0 por factorización y fórmula general. Resuelve problemas cuyo planteamiento es una ecuación cuadrática."
          }
        },
        {
          id: "MA07", num: 7,
          titulo: "Funciones.",
          pdas: {
            "1": "Relaciona e interpreta relaciones proporcional y no proporcional a partir de su representación tabular, gráfica y con diagramas. Modela y resuelve diversas situaciones a través de ecuaciones proporcionales con constante positiva y negativa.",
            "2": "Relaciona e interpreta la proporcionalidad inversa de dos magnitudes o cantidades, además usa una tabla, gráfica o representación algebraica en diversos contextos.",
            "3": "Relaciona e interpreta la variación de dos cantidades a partir de su representación tabular, gráfica y algebraica. Explora diversos procedimientos para resolver problemas de reparto proporcional."
          }
        },
        {
          id: "MA08", num: 8,
          titulo: "Rectas y ángulos.",
          pdas: {
            "1": "Explora las figuras básicas como rectas y ángulos y su notación. Encuentra y calcula los ángulos que se forman al intersecar dos segmentos.",
            "2": "Identifica y usa las relaciones entre los ángulos, lados y diagonales para construir a escala triángulos, cuadriláteros y polígonos regulares o irregulares.",
            "3": "N/A"
          }
        },
        {
          id: "MA09", num: 9,
          titulo: "Construcción y propiedades de las figuras planas y cuerpos.",
          pdas: {
            "1": "Utiliza la regla y el compás para trazar: punto medio, mediatriz de un segmento, segmentos y ángulos congruentes, bisectriz de un ángulo, rectas perpendiculares y rectas paralelas. Identifica y traza las rectas notables en triángulos y cuadriláteros. Construye y clasifica triángulos y cuadriláteros a partir del análisis de distinta información.",
            "2": "Construye con regla y compás polígonos regulares con distinta información. Identifica y usa las relaciones entre figuras en la construcción de teselados.",
            "3": "Aplica las propiedades de la congruencia y semejanza de triángulos al construir y resolver problemas. Reconoce las propiedades de los sólidos. Explora la generación de sólidos de revolución a partir de figuras planas. Explora y construye desarrollos planos de diferentes figuras tridimensionales, cilindros, pirámides y conos."
          }
        },
        {
          id: "MA10", num: 10,
          titulo: "Circunferencia, círculo y esfera.",
          pdas: {
            "1": "Identifica y traza las rectas notables en la circunferencia y las relaciones entre ellas. Investiga figuras relacionadas con círculos y propiedades de los círculos. Construye circunferencias a partir de distinta información.",
            "2": "Determina la medida de ángulos inscritos y centrales, así como de arcos de circunferencia. Explora las intersecciones entre círculos y figuras al calcular perímetros y áreas.",
            "3": "Explora y construye desarrollos planos de esferas. Indaga la generación de esferas a partir de figuras planas. Encuentra relaciones de volumen de la esfera, el cono y el cilindro."
          }
        },
        {
          id: "MA11", num: 11,
          titulo: "Medición y cálculo en diferentes contextos.",
          pdas: {
            "1": "Introduce la idea de distancia entre dos puntos como la longitud del segmento que los une. Encuentra la distancia de un punto a una recta y la distancia entre dos rectas paralelas. Explora la desigualdad del triángulo. Obtiene y aplica fórmulas o usa otras estrategias para calcular el perímetro y el área de polígonos regulares e irregulares y del círculo.",
            "2": "Resuelve problemas que implican conversiones en múltiplos y submúltiplos del metro, litro, kilogramo y de unidades del sistema inglés (yarda, pulgada, galón, onza y libra). Utiliza estrategias diversas para determinar el perímetro y el área de figuras compuestas.",
            "3": "Usa diferentes estrategias para calcular el volumen de prismas, pirámides y cilindros. Formula, justifica y usa el teorema de Pitágoras al resolver problemas. Resuelve problemas utilizando las razones trigonométricas seno, coseno y tangente."
          }
        },
        {
          id: "MA12", num: 12,
          titulo: "Obtención y representación de información.",
          pdas: {
            "1": "Usa tablas, gráficas de barras y circulares para el análisis de información.",
            "2": "Recolecta, registra, lee y comunica información mediante histogramas, gráficas poligonales y de línea.",
            "3": "Lee, interpreta y comunica información de cualquier tipo de gráficas."
          }
        },
        {
          id: "MA13", num: 13,
          titulo: "Interpretación de la información a través de medidas de tendencia central y de dispersión.",
          pdas: {
            "1": "Determina e interpreta la frecuencia absoluta, la frecuencia relativa, la media, la mediana y la moda en un conjunto de datos. Usa e interpreta las medidas de tendencia central (moda, media aritmética y mediana) y el rango de un conjunto de datos, y justifica con base en ellas sus decisiones.",
            "2": "Usa e interpreta las medidas de tendencia central (moda, media aritmética y mediana) y de dispersión (rango y la desviación media) de un conjunto de datos, y justifica con base en ellas sus decisiones. Identifica tendencias en los datos centrándose en sus valores representativos y sus variaciones.",
            "3": "Determina y compara las medidas de tendencia central (media, mediana y moda) y de dispersión (rango y desviación media) de dos conjuntos de datos para tomar decisiones."
          }
        },
        {
          id: "MA14", num: 14,
          titulo: "Azar y probabilidad.",
          pdas: {
            "1": "Compara cualitativamente dos o más eventos a partir de sus resultados posibles, usa relaciones como: es más probable que..., es menos probable que... Identifica eventos en los que interviene el azar, determina el espacio muestral y experimenta. Identifica diversos procedimientos de conteo y resuelve problemas.",
            "2": "Realiza experimentos aleatorios y registra los resultados en una tabla de frecuencia como la transición de la probabilidad frecuencial a la teórica. Analiza las características de la medida de la probabilidad y su equivalencia y representación en números decimales, fraccionarios y porcentajes.",
            "3": "Resuelve problemas donde se analicen las características de eventos complementarios y eventos mutuamente excluyentes e independientes. Resuelve problemas donde se calcule la probabilidad de ocurrencia de dos eventos mutuamente excluyentes y de eventos complementarios (regla de la suma). Resuelve problemas donde se calcule la probabilidad de ocurrencia de dos eventos independientes (regla del producto). Indaga las condiciones necesarias para que un juego de azar sea justo, con base en la noción de resultados equiprobables y no equiprobables."
          }
        },
      ]
    },

    "Biología": {
      grado: "1",
      contenidos: [
        {
          id: "BI01", num: 1,
          titulo: "Funcionamiento del cuerpo humano coordinado por los sistemas nervioso y endocrino.",
          pdas: {
            "1": "Explica la participación de los sistemas nervioso y endocrino en la coordinación de las funciones del cuerpo humano; reconoce el papel general de las hormonas y sus efectos en la maduración sexual y en la reproducción. Explica los efectos del consumo de sustancias adictivas en el sistema nervioso y en el funcionamiento integral del cuerpo humano; argumenta la importancia de evitar su consumo a partir del análisis de sus implicaciones en la salud, la sexualidad, la economía y la sociedad; comparte sus aprendizajes por distintos medios."
          }
        },
        {
          id: "BI02", num: 2,
          titulo: "Salud sexual y reproductiva: prevención de infecciones de transmisión sexual y del embarazo en adolescentes.",
          pdas: {
            "1": "Compara las maneras en que la cultura influye en el concepto de sexualidad; reconoce que todas las culturas tienen maneras distintas de comprender el género, la sexualidad y la reproducción; y reflexiona acerca de que el inicio de la actividad sexual debe ser de manera consensuada. Cuestiona creencias, estereotipos y costumbres que impactan negativamente la salud sexual y reproductiva de niñas y mujeres; reconoce la importancia de la igualdad de género y la responsabilidad compartida del hombre y la mujer en la prevención del embarazo en la adolescencia como base para la toma de decisiones. Compara la efectividad de los métodos anticonceptivos como apoyo para planificar el embarazo desde la perspectiva del proyecto de vida, con acompañamiento de los servicios amigables; valora la efectividad del condón por su doble protección."
          }
        },
        {
          id: "BI03", num: 3,
          titulo: "Prevención de enfermedades relacionadas con la alimentación y el consumo de alimentos ultraprocesados.",
          pdas: {
            "1": "Identifica causas de la obesidad y la diabetes relacionadas con la dieta y el sedentarismo, a fin de formular su proyecto de vida saludable; incluye factores protectores y propone acciones para reducir factores de riesgo, incluyendo su entorno familiar y comunitario. Formula hipótesis acerca de las consecuencias de carencia o exceso de nutrimentos en la dieta; interpreta datos que muestran la correlación entre la incidencia de enfermedades como la caries e hipertensión y el consumo de exceso de sal, azúcar y grasas saturadas."
          }
        },
        {
          id: "BI04", num: 4,
          titulo: "La diversidad de saberes e intercambio de conocimientos acerca de los seres vivos y las relaciones con el medio ambiente.",
          pdas: {
            "1": "Reconoce la importancia de los conocimientos, prácticas e innovaciones de los pueblos originarios acerca de los seres vivos; intercambia vivencias y experiencias asociadas al aprovechamiento y la protección como el uso de la herbolaria, la milpa o la conservación de los bosques. Explica por qué los saberes de los pueblos originarios han aportado al aprovechamiento de los recursos naturales en el ecosistema local; analiza sus contribuciones a la agricultura, el pastoreo y la pesca sustentables; comunica sus hallazgos usando diferentes lenguajes y representaciones."
          }
        },
        {
          id: "BI05", num: 5,
          titulo: "Los procesos vitales de los seres vivos: nutrición, relación con el medio y reproducción.",
          pdas: {
            "1": "Compara las características comunes de los seres vivos; identifica que todos tienen estructuras especializadas asociadas a la nutrición, la relación con el medio y la reproducción y los distingue como rasgos adaptativos que favorecen la sobrevivencia de las especies. Clasifica organismos de acuerdo con características comunes asociadas a la nutrición y reproducción; propone hipótesis en torno a posibles relaciones de parentesco entre ellos y las contrasta con fuentes de consulta; reconoce que todas las clasificaciones tienen alcances y limitaciones."
          }
        },
        {
          id: "BI06", num: 6,
          titulo: "La biodiversidad como expresión del cambio de los seres vivos en el tiempo.",
          pdas: {
            "1": "Analiza información acerca del estado de la biodiversidad local a partir de fuentes directas, orales, escritas, audiovisuales o Internet, expone razones sobre su importancia cultural, biológica, estética y ética; propone acciones para su cuidado. Indaga las principales aportaciones de Darwin y Wallace, las identifica como una de las explicaciones más fundamentadas acerca del origen de la biodiversidad y reflexiona acerca de cómo han cambiado; reconoce que los conocimientos científicos son un proceso en construcción permanente."
          }
        },
        {
          id: "BI07", num: 7,
          titulo: "El calentamiento global como una consecuencia de la alteración de los ciclos biogeoquímicos en los ecosistemas.",
          pdas: {
            "1": "Representa la transferencia de materia y energía entre los organismos de un ecosistema mediante redes y pirámides tróficas; elabora explicaciones, inferencias y predicciones consistentes con los modelos generados acerca de la pérdida o incremento de organismos en los eslabones. Identifica interacciones de competencia e interdependencia en el ecosistema local y explica cómo regulan el funcionamiento y mantenimiento en la dinámica general del ecosistema. Analiza las prácticas de consumo que han alterado los ciclos biogeoquímicos del carbono y el nitrógeno, sus efectos asociados al calentamiento global y sus impactos en el medio ambiente y la salud."
          }
        },
        {
          id: "BI08", num: 8,
          titulo: "Importancia del microscopio para el conocimiento de la unidad y la diversidad de los seres vivos.",
          pdas: {
            "1": "Compara cómo han cambiado las primeras observaciones microscópicas respecto de las actuales; valora el avance en el conocimiento de las bacterias, las células y los virus. Describe las estructuras y funciones básicas de la célula a partir de modelos; explica la participación de la membrana y el citoplasma en las funciones de nutrición y relación, y del núcleo en la reproducción y la herencia. Formula preguntas y contrasta explicaciones acerca de la manipulación genética; comparte sus hallazgos respecto de sus beneficios y riesgos en los ámbitos de la salud y el medio ambiente; participa en debates en los que defiende su postura."
          }
        },
        {
          id: "BI09", num: 9,
          titulo: "Las vacunas: su relevancia en el control de algunas enfermedades infecciosas.",
          pdas: {
            "1": "Describe las características generales de las bacterias y los virus; formula hipótesis en torno al por qué de la rápida propagación de las enfermedades infecciosas que causan, y las contrasta con evidencias reportadas en fuentes con sustento científico. Valora la importancia y la necesidad de proteger la salud con el uso de las vacunas para el control de algunas enfermedades infecciosas; evalúa sus riesgos y beneficios sociales y económicos; reconoce la interacción de los conocimientos científicos y tecnológicos, sus alcances y limitaciones."
          }
        },
      ]
    },

    "Física": {
      grado: "2",
      contenidos: [
        {
          id: "FI01", num: 1,
          titulo: "El pensamiento científico, una forma de plantear y solucionar problemas y su incidencia en la transformación de la sociedad.",
          pdas: {
            "2": "Describe problemas comunes de la vida cotidiana explicando cómo se procede para buscarles solución; conoce y caracteriza el pensamiento científico para plantearse y resolver problemas en la escuela y su cotidianeidad. Indaga en diferentes fuentes de consulta las aportaciones de mujeres y hombres en el desarrollo de la Física y su contribución al conocimiento científico y tecnológico a nivel nacional e internacional para valorar su influencia en la sociedad actual."
          }
        },
        {
          id: "FI02", num: 2,
          titulo: "Unidades y medidas utilizados en Física.",
          pdas: {
            "2": "Identifica las unidades de medición que se ocupan en su entorno escolar, familiar y en su comunidad. Identifica cuáles son, cómo se definen y cuál es la simbología de las unidades básicas y derivadas del Sistema Internacional de Unidades. Conoce los instrumentos de medición y realiza conversiones con los múltiplos y submúltiplos al referirse a una magnitud."
          }
        },
        {
          id: "FI03", num: 3,
          titulo: "Estructura, propiedades y características de la materia.",
          pdas: {
            "2": "Indaga sobre los saberes y prácticas del uso de materiales y sus propiedades y características para construcción, vestimenta y artefactos de uso común. Relaciona e interpreta las teorías sobre estructura de la materia, a partir de los modelos atómicos y de partículas y los fenómenos que les dieron origen. Explora algunos avances recientes en la comprensión de la constitución de la materia y reconoce el proceso histórico de construcción de nuevas teorías."
          }
        },
        {
          id: "FI04", num: 4,
          titulo: "Estados de agregación de la materia.",
          pdas: {
            "2": "Experimenta e interpreta los modelos atómicos y de partículas al proponer hipótesis que expliquen los tres estados de la materia, sus propiedades físicas como la temperatura de fusión, ebullición, densidad, entre otros. Interpreta la temperatura y el equilibrio térmico con base en el modelo de partículas."
          }
        },
        {
          id: "FI05", num: 5,
          titulo: "Interacciones en fenómenos relacionados con la fuerza y el movimiento.",
          pdas: {
            "2": "Experimenta e interpreta las interacciones de la fuerza y el movimiento relacionados con las Leyes de Newton para explicar actividades cotidianas. Identifica los elementos y los diferentes tipos de movimiento relacionados con la velocidad y aceleración y realiza experimentos sencillos. Identifica y describe la presencia de fuerzas en interacciones cotidianas (fricción y fuerzas en equilibrio)."
          }
        },
        {
          id: "FI06", num: 6,
          titulo: "Principios de Pascal y de Arquímedes.",
          pdas: {
            "2": "Experimenta e interpreta las interacciones de la fuerza y el movimiento relacionados con los principios de Pascal y de Arquímedes, para explicar actividades cotidianas. Identifica algunos dispositivos de uso cotidiano en los cuales se aplica el Principio de Pascal (sistemas de frenos hidráulicos, elevadores y gatos hidráulicos) y de Arquímedes (flotación de barcos, submarinos y globos aerostáticos, entre otros); colabora en equipo para proponer actividades experimentales y resolver problemas sencillos relativos a las propiedades de los fluidos."
          }
        },
        {
          id: "FI07", num: 7,
          titulo: "Saberes y prácticas para el aprovechamiento de energías y la sustentabilidad.",
          pdas: {
            "2": "Analiza las características de la energía mecánica (cinética y potencial) y describe casos donde se conserva. Relaciona el calor como una forma de energía y describe los motores que funcionan con energía calorífica, los efectos del calor disipado y los gases expelidos y valora sus efectos en la atmósfera. Identifica saberes, prácticas y artefactos sobre el aprovechamiento de las diversas formas de energía renovables y no renovables, su empleo y origen en su comunidad (solar, eólica, hidráulica, geológica, mareomotriz y nuclear) y valora sus beneficios. Realiza experimentos en donde se aproveche la energía del Sol ya sea considerando las propiedades de la luz (energía solar) o las de la materia (convección)."
          }
        },
        {
          id: "FI08", num: 8,
          titulo: "Interacciones de la electricidad y el magnetismo.",
          pdas: {
            "2": "Experimenta e interpreta algunas manifestaciones y aplicaciones de la electricidad e identifica los cuidados que requiere su uso al revisar protocolos de seguridad. Relaciona e interpreta fenómenos comunes del magnetismo y experimenta con la interacción entre imanes. Experimenta e interpreta el comportamiento de la luz como resultado de la interacción entre electricidad y magnetismo. Explica el funcionamiento de aparatos tecnológicos de comunicación, a partir de las ondas electromagnéticas."
          }
        },
        {
          id: "FI09", num: 9,
          titulo: "Composición del Universo y el Sistema Solar.",
          pdas: {
            "2": "Indaga algunos avances recientes en la comprensión sobre la evolución del Universo y su composición. Indaga cómo se lleva a cabo la exploración de los cuerpos celestes, por medio de la detección y procesamiento de las ondas electromagnéticas que emiten. Relaciona e interpreta las características y dinámica del Sistema Solar con la gravitación y el movimiento de los planetas, en particular el caso de la Tierra y la Luna."
          }
        },
        {
          id: "FI10", num: 10,
          titulo: "Fenómenos, procesos y factores asociados al cambio climático.",
          pdas: {
            "2": "Formula hipótesis que relacionan la actividad humana con el aumento de temperatura en el planeta y la emisión de gases de efecto invernadero; diferencia entre calor, radiación y temperatura al explicar los procesos que lo originan. Indaga sobre fenómenos meteorológicos extremos como olas de calor, ciclones tropicales, sequías y lluvias torrenciales; representa y explica su distribución en el mundo. Propone medidas de mitigación y adaptación, encaminadas al cuidado del medio ambiente y el bienestar común, viables para su aplicación en su escuela y comunidad."
          }
        },
      ]
    },

    "Química": {
      grado: "3",
      contenidos: [
        {
          id: "QU01", num: 1,
          titulo: "Los hitos que contribuyeron al avance del conocimiento científico y tecnológico en el ámbito nacional e internacional, así como su relación en la satisfacción de necesidades humanas y sus implicaciones en la naturaleza.",
          pdas: {
            "3": "Reconoce los aportes de saberes de diferentes pueblos y culturas en la satisfacción de necesidades humanas en diversos ámbitos (medicina, construcción, artesanías, textiles y alimentos). Indaga en fuentes de consulta orales y escritas las aportaciones de mujeres y hombres en el desarrollo del conocimiento científico y tecnológico, para valorar su influencia en la sociedad actual. Reflexiona acerca de los hábitos de consumo responsable a partir del análisis de las actividades relacionadas con el cuidado del medio ambiente a nivel personal, familiar y social, como base para la toma de decisiones orientadas a la sustentabilidad."
          }
        },
        {
          id: "QU02", num: 2,
          titulo: "Las propiedades extensivas e intensivas, como una forma de identificar sustancias y materiales de uso común.",
          pdas: {
            "3": "Formula hipótesis para diferenciar propiedades extensivas e intensivas mediante actividades experimentales y, con base en el análisis de resultados, elabora conclusiones. Reconoce la importancia del uso de instrumentos de medición para identificar y diferenciar propiedades de sustancias y materiales."
          }
        },
        {
          id: "QU03", num: 3,
          titulo: "Presencia de contaminantes y su concentración, relacionada con la degradación y contaminación ambiental en la comunidad.",
          pdas: {
            "3": "Indaga situaciones problemáticas relacionadas con la degradación y contaminación en la comunidad, vinculadas con el uso de productos y procesos químicos. Sistematiza la información de diferentes fuentes de consulta, orales y escritas, acerca de la concentración de contaminantes (partes por millón <ppm>) en aire, agua y suelo. Diseña y lleva a cabo proyectos comunitarios con la intención de proponer medidas preventivas o alternativas de solución, factibles y sustentables para el cuidado de la salud y el medio ambiente."
          }
        },
        {
          id: "QU04", num: 4,
          titulo: "Mezclas, compuestos y elementos representados con el modelo corpuscular de la materia en sólidos, líquidos y gases, así como su caracterización.",
          pdas: {
            "3": "Explica semejanzas y diferencias de mezclas, compuestos y elementos, a partir de actividades experimentales y los clasifica en materiales de uso cotidiano. Construye modelos corpusculares de mezclas, compuestos y elementos, a fin de comprender la estructura interna de los materiales en diferentes estados de agregación."
          }
        },
        {
          id: "QU05", num: 5,
          titulo: "Los compuestos iónicos y moleculares: propiedades y estructura, así como su importancia en diferentes ámbitos.",
          pdas: {
            "3": "Experimenta y diferencia los compuestos iónicos y moleculares, a partir de las propiedades identificadas en actividades experimentales; elabora conclusiones, inferencias y predicciones con base en la evidencia obtenida. Analiza la formación y estructura de compuestos iónicos y moleculares, a partir de las propiedades de la Tabla periódica. Valora el aprovechamiento de propiedades de compuestos iónicos y moleculares en el cuerpo humano y en diferentes ámbitos."
          }
        },
        {
          id: "QU06", num: 6,
          titulo: "Los alimentos como fuente de energía química: carbohidratos, proteínas y lípidos.",
          pdas: {
            "3": "Reconoce los saberes de pueblos y culturas acerca de la diversidad de los alimentos y su importancia en el diseño de menús orientados a una dieta saludable acorde al contexto. Explica cómo obtiene la energía el cuerpo humano a partir de los nutrimentos e identifica los alimentos que los contienen. Valora la importancia de vitaminas, minerales y agua simple potable, para el adecuado funcionamiento del cuerpo humano e identifica los impactos de su deficiencia."
          }
        },
        {
          id: "QU07", num: 7,
          titulo: "Propiedades de ácidos y bases, reacciones de neutralización y modelo de Arrhenius.",
          pdas: {
            "3": "Distingue las propiedades de ácidos y bases en su entorno a partir de indicadores e interpreta la escala de acidez y basicidad. Deduce los productos de reacciones de neutralización sencillas con base en el modelo de Arrhenius, mediante actividades experimentales. Diseña y lleva a cabo reacciones de neutralización a fin de obtener productos útiles en la vida cotidiana, así como para el tratamiento de residuos. Evalúa los beneficios y riesgos a la salud y al medio ambiente de ácidos y bases, en diversos ámbitos a través del pensamiento crítico."
          }
        },
        {
          id: "QU08", num: 8,
          titulo: "Las reacciones de óxido-reducción (redox): identificación del número de oxidación y de agentes oxidantes y reductores.",
          pdas: {
            "3": "Identifica reacciones de redox en su entorno y comprende su importancia en diferentes ámbitos. Analiza la transferencia de electrones entre reactivos y productos en reacciones de redox con base en el cambio del número de oxidación, a partir de actividades experimentales."
          }
        },
      ]
    },
  },

  // ============================================================
  // CAMPO 3: ÉTICA, NATURALEZA Y SOCIEDADES
  // Fuente: Programa Sintético Fase 6, SEP 2022 — páginas 79-107
  // ============================================================
  "Ética, Naturaleza y Sociedades": {

    "Geografía": {
      grado: "1",
      contenidos: [
        {
          id: "GE01", num: 1,
          titulo: "Los riesgos de desastre, su relación con los procesos naturales y la vulnerabilidad de la población en lugares específicos.",
          pdas: {
            "1": "Identifica que los desastres pueden ser originados por procesos naturales o por las actividades humanas. Relaciona los efectos ambientales, sociales y económicos de los desastres recientes en México y el mundo, tomando en cuenta la vulnerabilidad de la población. Valora la importancia de consolidar una cultura de prevención de desastres con la participación de instituciones, organismos y la sociedad."
          }
        },
        {
          id: "GE02", num: 2,
          titulo: "Crecimiento, distribución, composición y migración de la población.",
          pdas: {
            "1": "Analiza las implicaciones sociales, ambientales y económicas del crecimiento, distribución y composición de la población en diferentes países, con base en información estadística y cartográfica. Emplea las nociones de concentración y dispersión de la población para explicar los rasgos y problemas del espacio urbano y el rural. Distingue la movilidad como un derecho humano, los tipos de migración y principales flujos migratorios para comprender los efectos socioeconómicos y culturales en los lugares de atracción y expulsión de población."
          }
        },
        {
          id: "GE03", num: 3,
          titulo: "Los procesos productivos y sus consecuencias ambientales y sociales en la comunidad, México y el mundo.",
          pdas: {
            "1": "Compara procesos productivos y espacios económicos en México y el mundo, para reconocer sus implicaciones sociales, económicas y ambientales. Analiza y relaciona distintos procesos productivos sustantivos en la conformación social, económica y espacial de las sociedades a nivel mundial, para identificar sus contradicciones y desigualdades."
          }
        },
        {
          id: "GE04", num: 4,
          titulo: "Las prácticas de producción, distribución y consumo sustentables como alternativas para preservar el medio ambiente y asegurar el bienestar de las generaciones presentes y futuras.",
          pdas: {
            "1": "Comprende qué es la sustentabilidad e identifica prácticas de producción, distribución y consumo sustentables. Argumenta sobre prácticas sustentables de producción, distribución y consumo que pueden contribuir al bienestar de la comunidad y de México. Propone alternativas sustentables de desarrollo social para la preservación del medio ambiente y el bienestar de las generaciones presentes y futuras."
          }
        },
        {
          id: "GE05", num: 5,
          titulo: "Las desigualdades socioeconómicas en México y el mundo, y sus efectos en la calidad de vida de las personas.",
          pdas: {
            "1": "Comprende qué son las desigualdades socioeconómicas e identifica sus efectos y repercusiones en la vida de las personas. Argumenta las desigualdades socioeconómicas en México y el mundo, mediante la interpretación del Índice de Desarrollo Humano (IDH) y el Índice para una vida mejor, para explicar sus efectos en la calidad de vida. Propone acciones para reducir las desigualdades socioeconómicas en la comunidad, México y el mundo."
          }
        },
        {
          id: "GE06", num: 6,
          titulo: "Los conflictos territoriales actuales en México y el mundo, y sus implicaciones ambientales y sociales.",
          pdas: {
            "1": "Debate acerca de la multicausalidad de los conflictos territoriales en México y el mundo, la importancia de la ubicación geográfica de las partes involucradas y las consecuencias ambientales, sociales, económicas y políticas en México y el mundo. Promueve alternativas de resolución justas y pacíficas a los conflictos territoriales que afectan a la comunidad, a México y al mundo."
          }
        },
        {
          id: "GE07", num: 7,
          titulo: "Los retos sociales y ambientales en la comunidad, en México y el mundo.",
          pdas: {
            "1": "Reconoce cómo las problemáticas sociales y ambientales afectan a la comunidad. Asume responsabilidad como agente de cambio para encontrar soluciones a las problemáticas sociales y ambientales de la comunidad."
          }
        },
        {
          id: "GE08", num: 8,
          titulo: "La diversidad de grupos sociales y culturales en México.",
          pdas: {
            "1": "Reconoce la diversidad de pueblos originarios, afromexicanos, migrantes, grupos urbanos, grupos sociales en México, como parte de la identidad nacional pluricultural y la compara con la diversidad social y cultural en el mundo. Valora la importancia del espacio en la conformación de las identidades juveniles."
          }
        },
        {
          id: "GE09", num: 9,
          titulo: "El suelo, recurso estratégico para la seguridad alimentaria y la vida en el planeta.",
          pdas: {
            "1": "Indaga sobre el origen, los usos y los problemas del suelo en la localidad. Reflexiona acerca de la contradicción que existe entre los países con suelo de vocación agrícola y la poca productividad asociada con los problemas del suelo (sobreexplotación, degradación, pérdida, entre otros). Comparte alternativas para la protección y recuperación del suelo y colabora de manera organizada y solidaria en acciones comunitarias orientadas a ese fin en la localidad donde vive."
          }
        },
        {
          id: "GE10", num: 10,
          titulo: "El reto del cambio climático.",
          pdas: {
            "1": "Reconoce las relaciones e interacciones entre los elementos y los factores del clima como base para comprender, de manera general, la distribución de las regiones naturales en la Tierra y analizar la biodiversidad en el mundo. Indaga y analiza de manera crítica los cambios ocurridos en el clima, sus causas y consecuencias en México y el mundo. Asume una postura crítica y activa ante los fenómenos derivados del calentamiento global y el cambio climático."
          }
        },
      ]
    },

    "Historia": {
      contenidos: [
        {
          id: "HI01", num: 1,
          titulo: "Los albores de la humanidad: los pueblos antiguos del mundo y su devenir.",
          pdas: {
            "1": "Busca, localiza y estudia con sus pares fuentes que dan cuenta de mitos fundacionales de pueblos antiguos. Reflexiona acerca de la importancia de las fuentes históricas para la interpretación de hechos y procesos. Compara y encuentra lo común y lo diverso entre mitos fundacionales de pueblos antiguos de México y de otras partes del mundo. Reflexiona y toma postura en torno a las teorías que explican el poblamiento original de América. Distingue y clasifica evidencias históricas que le permiten acercarse al conocimiento del poblamiento original de América. Investiga acerca de restos fósiles humanos encontrados en lo que hoy es el territorio de nuestro país. Reflexiona en torno al caso del llamado Hombre de Tepexpan y la necesidad de una historia inclusiva que recupere las aportaciones de las mujeres.",
            "3": "Recupera las explicaciones de Charles Darwin acerca del origen y evolución de la biodiversidad y particulariza en el caso del ser humano. Investiga acerca de restos fósiles de homínidos encontrados en todo el mundo y organiza la información. Explica cómo se construye la representación de la prehistoria a través de la manufactura de artefactos o estructuras. Aplica el eje organizador uso y gestión del agua y su impacto para analizar el desarrollo histórico de las antiguas civilizaciones mesopotámica, egipcia, hindú y china. Indaga a partir de la noción de espacio ecúmene aplicada a los antiguos pueblos fenicio, egipcio, cretense, cartaginés, griego y romano en la cuenca del mar mediterráneo."
          }
        },
        {
          id: "HI02", num: 2,
          titulo: "La conformación de las metrópolis y los sistemas de dominación.",
          pdas: {
            "1": "Formula preguntas, recopila información y comparte sus hallazgos en torno a los primeros pueblos en el territorio de lo que ahora es nuestro país.",
            "2": "Indaga acerca del desarrollo del comercio y su impacto en la geografía y la navegación.",
            "3": "Indaga sobre el desarrollo de las ciudades en Italia y Flandes durante los siglos XIV y XV, como expresión temprana de integración de la economía, la sociedad, la cultura y la política. Analiza el proceso de integración de los antiguos pueblos de la Cuenca del Mar Mediterráneo para explicarse las tensiones y conflictos entre persas y griegos."
          }
        },
        {
          id: "HI03", num: 3,
          titulo: "Las gestas de resistencia y los movimientos independentistas.",
          pdas: {
            "1": "Indaga sobre rebeliones y levantamientos de pueblos indígenas y afromexicanos en el periodo colonial.",
            "2": "Relaciona la Revolución de Independencia de 1810 en nuestro país con el contexto internacional.",
            "3": "Elabora una cronología de las luchas de independencia de los países de América Latina."
          }
        },
        {
          id: "HI04", num: 4,
          titulo: "Las revoluciones modernas y sus tendencias.",
          pdas: {
            "1": "N/A",
            "2": "Establece las características y el contexto en que surgieron las revoluciones modernas.",
            "3": "Ubica la confluencia de causas para que la primera guerra mundial ocurriera."
          }
        },
        {
          id: "HI05", num: 5,
          titulo: "Las tensiones en el siglo XX.",
          pdas: {
            "1": "N/A",
            "2": "Analiza y comprende la causalidad de la segunda guerra mundial.",
            "3": "Analiza y comprende las causas y efectos de la guerra fría."
          }
        },
        {
          id: "HI06", num: 6,
          titulo: "La construcción histórica de las ideas sobre las juventudes e infancias.",
          pdas: {
            "1": "Identifica las ideas y representaciones de las personas de acuerdo con su edad en diversos momentos históricos.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "HI07", num: 7,
          titulo: "Las mujeres y sus historias.",
          pdas: {
            "1": "Revisa fuentes históricas para identificar el papel de las mujeres en distintos momentos históricos.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "HI08", num: 8,
          titulo: "Las luchas de las mujeres por sus derechos.",
          pdas: {
            "1": "Identifica los orígenes históricos de movimientos y organizaciones de mujeres en México y el mundo.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "HI09", num: 9,
          titulo: "Relaciones de poder y lucha por los derechos de grupos históricamente discriminados o subrepresentados.",
          pdas: {
            "1": "Identifica las problemáticas de violencia hacia pueblos originarios, afrodescendientes, migrantes y comunidad LGBTTTIQ+ en distintos procesos históricos.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "HI10", num: 10,
          titulo: "Discriminación, racismo, sexismo y prejuicios como construcciones históricas.",
          pdas: {
            "1": "Identifica las causas históricas del racismo y la xenofobia y las relaciona críticamente con sus manifestaciones en el presente.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "HI11", num: 11,
          titulo: "Movilidades humanas, migraciones y nuevos escenarios para la vida.",
          pdas: {
            "1": "Comprende procesos históricos relevantes en los que grupos humanos se desplazaron por los territorios a lo largo de la historia.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "HI12", num: 12,
          titulo: "Amor, amistad, familias y relaciones entre las personas en la historia.",
          pdas: {
            "1": "Comprende que la forma en la que las personas piensan y actúan en relación con el amor, la amistad, las familias y las relaciones interpersonales ha cambiado a lo largo de la historia.",
            "2": "N/A",
            "3": "N/A"
          }
        },
        {
          id: "HI13", num: 13,
          titulo: "Grupos sociales y culturales en la conformación de las identidades juveniles.",
          pdas: {
            "1": "Valora la diversidad de grupos e identidades juveniles en la escuela y en la comunidad y fortalece el sentido de pertenencia.",
            "2": "Argumenta sobre el derecho a pertenecer a una cultura, grupo social, económico, ideológico, entre otros.",
            "3": "Promueve espacios de participación juvenil, presenciales o virtuales, para construir relaciones de convivencia."
          }
        },
      ]
    },

    "Formación Cívica y Ética": {
      contenidos: [
        {
          id: "FC01", num: 1,
          titulo: "Los derechos humanos en México y en el mundo como valores compartidos por las sociedades actuales.",
          pdas: {
            "1": "Asume una postura crítica acerca de la vigencia de los derechos humanos como valores compartidos por distintas sociedades del mundo.",
            "2": "Propone acciones orientadas a fortalecer la igualdad de derechos, el bienestar colectivo y el respeto a la dignidad humana en poblaciones en situación de vulnerabilidad.",
            "3": "Debate acerca de la importancia de defender y exigir el respeto a los derechos humanos, como un reto de las sociedades actuales."
          }
        },
        {
          id: "FC02", num: 2,
          titulo: "Movimientos sociales y políticos por los derechos humanos en el mundo y en México.",
          pdas: {
            "1": "Asume una postura ética acerca de los movimientos sociales y políticos que originaron los derechos humanos.",
            "2": "Explica la trascendencia de los movimientos sociales y políticos en México y América Latina, para la defensa de los derechos humanos.",
            "3": "Asume una postura ética sobre los movimientos sociales y políticos en la actualidad y propone acciones para fortalecer la defensa de los derechos humanos."
          }
        },
        {
          id: "FC03", num: 3,
          titulo: "Consecuencias de la desigualdad en la calidad de vida de las personas y comunidades.",
          pdas: {
            "1": "Analiza las causas que dan origen a las diferencias en la calidad de vida de la población en México.",
            "2": "Explica las consecuencias de la desigualdad socioeconómica en la calidad de vida de la comunidad.",
            "3": "Actúa éticamente para reducir las desigualdades, fomentando el respeto y la solidaridad en su entorno."
          }
        },
        {
          id: "FC04", num: 4,
          titulo: "Normas, leyes, instituciones y organizaciones encargadas de proteger, defender y exigir la aplicación de los derechos humanos en la convivencia diaria.",
          pdas: {
            "1": "Aprecia los beneficios de participar en la construcción y aplicación de normas y leyes para garantizar la convivencia y el ejercicio de los derechos humanos en la comunidad.",
            "2": "Participa en la creación y transformación de normas y leyes que aplican en distintos contextos, orientadas a favorecer la igualdad, la libertad, la justicia y los derechos humanos.",
            "3": "Analiza la función de instituciones y organizaciones nacionales e internacionales, para demandar la aplicación de normas y leyes que defienden y exigen respeto a los derechos humanos."
          }
        },
        {
          id: "FC05", num: 5,
          titulo: "El conflicto en la convivencia humana desde la cultura de paz.",
          pdas: {
            "1": "Analiza distintos tipos de conflictos en sus espacios de convivencia, su estructura y sus causas.",
            "2": "Propone distintas formas de resolver conflictos sociales y políticos ocurridos en México y América Latina.",
            "3": "Valora la resolución pacífica de conflictos sociales y políticos en México y el mundo."
          }
        },
        {
          id: "FC06", num: 6,
          titulo: "La cultura de paz y la creación de ambientes que garanticen el respeto a la vida y la dignidad del ser humano.",
          pdas: {
            "1": "Comprende la influencia que tiene la cultura de paz en la convivencia escolar, familiar y comunitaria, para favorecer ambientes que garanticen el respeto a la vida y la dignidad humana.",
            "2": "Aplica la cultura de paz para tomar decisiones responsables en contextos presenciales y virtuales que promuevan el respeto a la dignidad humana.",
            "3": "Colabora con personas de la escuela, la comunidad, el país y el mundo, para rechazar y denunciar la violencia, así como fortalecer la cultura de paz."
          }
        },
        {
          id: "FC07", num: 7,
          titulo: "Personas, grupos y organizaciones a favor de la cultura de paz.",
          pdas: {
            "1": "Aprecia las acciones de personas, grupos u organizaciones en México a favor de la cultura de paz.",
            "2": "Analiza las acciones de personas, grupos u organizaciones realizadas en México y el mundo a favor de la cultura de paz.",
            "3": "Valora las acciones que personas, grupos u organizaciones han realizado en México y el mundo a favor de la cultura de paz."
          }
        },
        {
          id: "FC08", num: 8,
          titulo: "Principios éticos como referentes para un desarrollo sustentable.",
          pdas: {
            "1": "Reflexiona éticamente acerca de la relación de las comunidades con la naturaleza para proponer acciones orientadas al desarrollo sustentable.",
            "2": "Evalúa la contribución de la ética en las prácticas de producción, distribución y consumo para proponer alternativas sustentables.",
            "3": "Implementa acciones de colaboración, reciprocidad, solidaridad y empatía orientadas al desarrollo sustentable."
          }
        },
        {
          id: "FC09", num: 9,
          titulo: "Igualdad sustantiva en el marco de la interculturalidad, la inclusión y la perspectiva de género.",
          pdas: {
            "1": "Aprecia la interculturalidad y el respeto al derecho a la igualdad sustantiva para establecer relaciones de convivencia incluyentes.",
            "2": "Elabora juicios éticos sobre problemas de injusticia y discriminación que afectan la igualdad sustantiva.",
            "3": "Participa en acciones dirigidas a reducir brechas de desigualdad para promover y fortalecer la igualdad sustantiva."
          }
        },
        {
          id: "FC10", num: 10,
          titulo: "Medidas de protección y mecanismos de denuncia en el rechazo a la violencia de género, sexual y la trata de personas.",
          pdas: {
            "1": "Analiza situaciones de violencia escolar, de género, sexual y la trata de personas, con base en la perspectiva de género y demanda la aplicación de medidas de protección y mecanismos de denuncia.",
            "2": "Compara los tipos de violencia escolar, de género y la trata de personas e identifica medidas de protección y mecanismos de denuncia.",
            "3": "Propone acciones de denuncia en contextos presenciales y en las redes sociales para garantizar el derecho a una vida libre de violencia."
          }
        },
        {
          id: "FC11", num: 11,
          titulo: "Principios y valores de la cultura democrática como forma de gobierno y de vida.",
          pdas: {
            "1": "Aprecia en los principios y valores de la democracia una forma de vida y de gobierno, para tomar decisiones responsables orientadas al bien común.",
            "2": "Propone acciones para fortalecer en su entorno los rasgos del Estado de derecho democrático.",
            "3": "Participa de manera activa, responsable e informada en la promoción, defensa y ejercicio de los principios y valores de la democracia."
          }
        },
        {
          id: "FC12", num: 12,
          titulo: "Proyectos como un recurso para atender problemáticas de la comunidad desde una ciudadanía democrática.",
          pdas: {
            "1": "Participa en actividades y proyectos en su entorno escolar y social, en donde aplica mecanismos de participación ciudadana.",
            "2": "Elabora proyectos orientados a resolver necesidades y problemas relacionados con la violencia escolar y de género.",
            "3": "Colabora en proyectos con la comunidad para responder a necesidades colectivas en sus dimensiones ética, política, social y ambiental."
          }
        },
        {
          id: "FC13", num: 13,
          titulo: "Instituciones, organizaciones y mecanismos de representación democrática.",
          pdas: {
            "1": "Aprecia la función de las instituciones y organizaciones sociales y políticas, así como de los mecanismos de participación democrática.",
            "2": "Destaca la importancia de la participación ciudadana, organizaciones sociales y partidos políticos para exigir a las autoridades que cumplan sus funciones.",
            "3": "Valora los retos que enfrenta la democracia en México y el mundo para involucrarse en su fortalecimiento."
          }
        },
        {
          id: "FC14", num: 14,
          titulo: "Defensa del derecho al acceso a la protección de datos personales, a la información, la transparencia y la rendición de cuentas en un gobierno democrático.",
          pdas: {
            "1": "Destaca la importancia de que las servidoras y los servidores públicos y representantes populares desempeñen sus funciones con apego a la ley de manera honesta, transparente y con rendición de cuentas.",
            "2": "Aprecia la participación ciudadana para exigir a las autoridades que cumplan sus funciones y administren los recursos públicos con honestidad, transparencia y legalidad.",
            "3": "Analiza el actuar de partidos políticos, organizaciones, gobiernos y las servidoras y los servidores públicos, mediante el acceso a la información, transparencia y rendición de cuentas."
          }
        },
        {
          id: "FC15", num: 15,
          titulo: "El derecho a la salud y la prevención en el consumo de drogas.",
          pdas: {
            "1": "Reconoce que el consumo de drogas afecta el derecho a la dignidad y la salud.",
            "2": "Promueve valores y habilidades para desarrollar la autoestima, la autorregulación y la resiliencia como factores de protección ante el consumo de drogas.",
            "3": "Toma decisiones autónomas, responsables y comprometidas con el bienestar propio y colectivo, para prevenir el consumo de drogas."
          }
        },
      ]
    },
  },

  // ============================================================
  // CAMPO 4: DE LO HUMANO Y LO COMUNITARIO
  // Fuente: Programa Sintético Fase 6, SEP 2022 — páginas 113-119
  // ============================================================
  "De lo Humano y lo Comunitario": {

    "Tecnología": {
      contenidos: [
        {
          id: "TE01", num: 1,
          titulo: "Herramientas, máquinas e instrumentos, como extensión corporal, en la satisfacción continua de intereses y necesidades humanas.",
          pdas: {
            "1": "Explora las posibilidades corporales y la delegación de funciones en herramientas, máquinas, instrumentos y formas de organización para identificar sus funciones y procesos de cambio técnico, en la satisfacción de intereses y necesidades de diversas sociedades.",
            "2": "Analiza las herramientas, máquinas, instrumentos y formas de organización, como una extensión de las posibilidades corporales para solucionar problemas en diversos contextos.",
            "3": "Amplía sus posibilidades corporales por medio del conocimiento y habilidades en el manejo de herramientas, máquinas, instrumentos y formas de organización en procesos técnicos comunitarios, para favorecer la inclusión y la sustentabilidad."
          }
        },
        {
          id: "TE02", num: 2,
          titulo: "Materiales, procesos técnicos y comunidad.",
          pdas: {
            "1": "Distingue el origen, transformación y características tecnológicas de los materiales que comparten técnicas similares, para utilizarlos desde una perspectiva local, eficiente y sustentable.",
            "2": "Explora el uso y transformación de los materiales, de acuerdo con sus características en los procesos técnicos de distintas comunidades, para prevenir daños sociales o a la naturaleza.",
            "3": "Implementa alternativas a situaciones que, por el origen, transformación, uso o desecho de los materiales, ponen en riesgo el entorno de la comunidad, para favorecer el desarrollo sustentable."
          }
        },
        {
          id: "TE03", num: 3,
          titulo: "Usos e implicaciones de la energía en los procesos técnicos.",
          pdas: {
            "1": "Comprende la función de la energía en los sistemas técnicos y sus implicaciones en el desarrollo tecnológico para la toma de decisiones responsables, que permitan prever y disminuir riesgos personales, sociales y naturales.",
            "2": "Explora las principales fuentes de energía en los procesos técnicos para su uso óptimo, así como las alternativas de prevención de riesgos personales, sociales y naturales.",
            "3": "Analiza diversas fuentes de energía en los procesos técnicos para considerar posibles alternativas sustentables en su funcionamiento."
          }
        },
        {
          id: "TE04", num: 4,
          titulo: "Pensamiento estratégico y creativo en la resolución de problemas.",
          pdas: {
            "1": "Analiza necesidades del entorno cercano para plantear un problema, investigar alternativas de solución y seleccionar la que mejor se adapte a los criterios y condiciones contextuales.",
            "2": "Planifica y organiza acciones, medios técnicos e insumos, para el desarrollo de alternativas de solución a diversos problemas identificados.",
            "3": "Implementa, da seguimiento y evalúa las propuestas conforme a los criterios y condiciones establecidas en un plan para satisfacer las necesidades o intereses identificados."
          }
        },
        {
          id: "TE05", num: 5,
          titulo: "Evaluación de sistemas tecnológicos.",
          pdas: {
            "1": "Comprende la importancia de la evaluación de los procesos como parte de la innovación y mejora continua, para el logro de la eficiencia, eficacia, fiabilidad y factibilidad de los sistemas técnicos.",
            "2": "Analiza las implicaciones de los procesos, productos o servicios en la naturaleza y la sociedad, para desarrollar sistemas técnicos sustentables.",
            "3": "Participa en la evaluación interna y externa de sistemas tecnológicos para mejorar su eficiencia, eficacia, fiabilidad y factibilidad desde un enfoque sustentable."
          }
        },
      ]
    },

    "Educación Socioemocional": {
      contenidos: [
        {
          id: "SE01", num: 1,
          titulo: "Formas de ser, pensar, actuar y relacionarse.",
          pdas: {
            "1": "Reconoce ideas, gustos, necesidades, posibilidades, intereses, deseos y experiencias, para favorecer el autoconocimiento y descubrimiento de nuevas potencialidades.",
            "2": "Analiza las formas de ser, pensar, actuar e interactuar, para comprender las diversas maneras de vivenciar situaciones cotidianas y lograr el bienestar personal y social.",
            "3": "Promueve el entendimiento mutuo y la toma de decisiones, considerando formas de ser, pensar, actuar y relacionarse ante diferentes situaciones y contextos, para lograr un mayor bienestar personal y social."
          }
        },
        {
          id: "SE02", num: 2,
          titulo: "Los sentimientos y su influencia en la toma de decisiones.",
          pdas: {
            "1": "Distingue entre emociones, estados de ánimo y sentimientos como elementos que contribuyen a la construcción de relaciones afectivas inclusivas y equitativas. Reconoce que los sentimientos son resultado de las vivencias y la cultura.",
            "2": "Reflexiona sobre cómo los sentimientos se construyen a partir de ideas y experiencias, para la toma de decisiones asertivas.",
            "3": "Gestiona los afectos para tomar decisiones asertivas y construir relaciones de convivencia inclusivas y equitativas."
          }
        },
        {
          id: "SE03", num: 3,
          titulo: "Construcción del proyecto de vida.",
          pdas: {
            "1": "Reconoce cambios presentes a lo largo de la vida y en la adolescencia para definir metas personales y en colectivo, a alcanzar en un corto, mediano y largo plazo. Valora metas individuales y de otras personas a partir de identificar situaciones y formas de actuar que las afectan, para favorecer su logro y el bienestar colectivo.",
            "2": "Analiza intereses y necesidades, así como logros y metas personales y compartidas de acuerdo con conocimientos, capacidades y habilidades desarrolladas hasta el momento para proponer ideas acerca de un proyecto de vida personal. Replantea sus metas a partir del análisis de logros y situaciones afrontadas, para favorecer el bienestar personal y comunitario.",
            "3": "Visualiza un proyecto de vida para determinar posibles retos a superar, estrategias de apoyo mutuo y acciones a realizar en favor del bienestar personal y colectivo. Reconoce nuevos intereses, habilidades y necesidades, propias y de las demás personas, con la finalidad de replantear metas individuales y grupales en favor del bienestar común."
          }
        },
        {
          id: "SE04", num: 4,
          titulo: "Prevención de situaciones de riesgo.",
          pdas: {
            "1": "Incorpora prácticas que inciden en la prevención de situaciones de riesgo ante accidentes, adicciones, formas de violencia y fenómenos naturales, para favorecer el desarrollo personal, familiar y comunitario, así como el cuidado del medio ambiente.",
            "2": "Participa en la construcción de alternativas personales, familiares y comunitarias, que favorezcan la prevención de situaciones de riesgo ante accidentes, adicciones, formas de violencia y fenómenos naturales, para lograr el bien común.",
            "3": "Reflexiona sobre las condiciones del contexto familiar y comunitario que representan situaciones de riesgo a la salud, a la seguridad y al medio ambiente para el autocuidado y el bienestar colectivo."
          }
        },
        {
          id: "SE05", num: 5,
          titulo: "Educación Integral en Sexualidad.",
          pdas: {
            "1": "Identifica las dimensiones de la sexualidad: biológica, psicológica, social, cultural, entre otras, en distintos momentos de su vida, para establecer relaciones en favor del bienestar.",
            "2": "Valora la identidad y la diversidad de formas de expresión de género para comprender la manera en que favorece la interacción con las personas y el desarrollo integral.",
            "3": "Promueve estrategias en favor de una educación integral en sexualidad para incorporarlas permanentemente en su proyecto de vida."
          }
        },
      ]
    },

    "Educación Física": {
      contenidos: [
        {
          id: "EF01", num: 1,
          titulo: "Capacidades, habilidades y destrezas motrices.",
          pdas: {
            "1": "Explora las capacidades, habilidades y destrezas motrices, para enriquecer y ampliar el potencial propio y de las demás personas.",
            "2": "Integra sus capacidades, habilidades y destrezas motrices, para poner a prueba el potencial individual y de conjunto.",
            "3": "Valora las capacidades, habilidades y destrezas propias y de las demás personas, para mostrar mayor disponibilidad corporal y autonomía motriz."
          }
        },
        {
          id: "EF02", num: 2,
          titulo: "Potencialidades cognitivas, expresivas, motrices, creativas y de relación.",
          pdas: {
            "1": "Pone en práctica los elementos de la condición física en actividades motrices y recreativas, para reconocerlas como alternativas que fomentan el bienestar individual y colectivo.",
            "2": "Analiza el incremento de su condición física, al participar en actividades recreativas, de iniciación deportiva y deporte educativo, para reflexionar acerca de su relación con el bienestar.",
            "3": "Diseña, organiza y participa en actividades recreativas, de iniciación deportiva y deporte educativo, con la intención de fomentar el bienestar personal y social."
          }
        },
        {
          id: "EF03", num: 3,
          titulo: "Estilos de vida activos y saludables.",
          pdas: {
            "1": "Implementa acciones que le permiten mantenerse físicamente activo en diferentes momentos del día, para favorecer la práctica de estilos de vida saludables.",
            "2": "Reflexiona acerca de los factores que afectan la práctica sistemática de actividad física, para proponer acciones que contribuyan a modificarlos o eliminarlos.",
            "3": "Diseña alternativas que fomenten la práctica de estilos de vida activos y saludables, a partir del análisis de comportamientos que ponen en riesgo la salud, para hacer frente a problemas asociados con el sedentarismo."
          }
        },
        {
          id: "EF04", num: 4,
          titulo: "Pensamiento lúdico, estratégico y creativo.",
          pdas: {
            "1": "Toma decisiones individuales y colectivas en situaciones de juego (defensivas u ofensivas), con el propósito de valorar su efectividad.",
            "2": "Valora las estrategias de juego que utiliza ante distintas condiciones que se presentan, para reestructurarlas e incrementar su efectividad.",
            "3": "Emplea el pensamiento estratégico para favorecer la colaboración y creatividad en la resolución de situaciones individuales y colectivas."
          }
        },
        {
          id: "EF05", num: 5,
          titulo: "Interacción motriz.",
          pdas: {
            "1": "Pone a prueba la interacción motriz en situaciones de juego, iniciación deportiva y deporte educativo, con el fin de alcanzar metas comunes y obtener satisfacción al colaborar con las demás personas.",
            "2": "Toma decisiones a favor de la participación colectiva en situaciones de iniciación deportiva y deporte educativo, para promover ambientes de aprendizaje y actitudes asertivas.",
            "3": "Promueve relaciones asertivas con las demás personas en situaciones de juego, iniciación deportiva y deporte educativo, para fortalecer su autoestima y fomentar el juego limpio y la confrontación lúdica."
          }
        },
      ]
    },
  },
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

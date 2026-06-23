/* Banco de preguntas de trivia · Martina XV
   Cada pregunta: { peli, n:nivel 1-5, q, op:[3 opciones], ok:índice correcto }
   n = dificultad (1 más fácil → 5 más difícil).
   El quiz arma 5 preguntas: una de cada nivel, en orden ascendente,
   de películas distintas. */
const BANCO = [
  // Enredados
  { peli:"Enredados", n:1, q:"¿Cómo se llama la protagonista?", op:["Rapunzel","Ariel","Aurora"], ok:0 },
  { peli:"Enredados", n:2, q:"¿Qué tiene de especial el pelo de Rapunzel?", op:["Brilla y cura","Es invisible","Cambia de color"], ok:0 },
  { peli:"Enredados", n:3, q:"¿Cómo se llama el ladrón que la ayuda?", op:["Flynn Rider","Aladdín","Eric"], ok:0 },
  { peli:"Enredados", n:4, q:"¿Qué sueltan al cielo en su cumpleaños?", op:["Farolitos","Globos","Fuegos artificiales"], ok:0 },
  { peli:"Enredados", n:5, q:"¿Qué animal es Pascal, su mascota?", op:["Un camaleón","Un gato","Un perro"], ok:0 },

  // Moana
  { peli:"Moana", n:1, q:"¿Dónde vive Moana?", op:["En una isla","En una montaña","En un castillo"], ok:0 },
  { peli:"Moana", n:2, q:"¿Cómo se llama el semidiós que la acompaña?", op:["Maui","Hércules","Tarzán"], ok:0 },
  { peli:"Moana", n:3, q:"¿Qué busca devolver Moana?", op:["El corazón de Te Fiti","Una corona","Un anillo"], ok:0 },
  { peli:"Moana", n:4, q:"¿Qué usa Maui como arma?", op:["Un anzuelo mágico","Una espada","Un arco"], ok:0 },
  { peli:"Moana", n:5, q:"¿Qué animal es Heihei?", op:["Un gallo","Un cerdo","Un pato"], ok:0 },

  // Ratatouille
  { peli:"Ratatouille", n:1, q:"¿Qué animal es Remy?", op:["Una rata","Un perro","Un gato"], ok:0 },
  { peli:"Ratatouille", n:2, q:"¿Con qué sueña Remy?", op:["Ser cocinero","Ser bombero","Ser músico"], ok:0 },
  { peli:"Ratatouille", n:3, q:"¿En qué ciudad ocurre la película?", op:["París","Roma","Londres"], ok:0 },
  { peli:"Ratatouille", n:4, q:"¿Cómo se llama el joven que cocina con Remy?", op:["Linguini","Mario","Luigi"], ok:0 },
  { peli:"Ratatouille", n:5, q:"¿Dónde se esconde Remy para guiar a Linguini?", op:["Bajo su gorro","En su bolsillo","En su zapato"], ok:0 },

  // Rey León
  { peli:"Rey León", n:1, q:"¿Cómo se llama el león protagonista?", op:["Simba","Mufasa","Scar"], ok:0 },
  { peli:"Rey León", n:2, q:"¿Cómo se llama el papá de Simba?", op:["Mufasa","Scar","Timón"], ok:0 },
  { peli:"Rey León", n:3, q:"¿Quién es el tío malvado de Simba?", op:["Scar","Zazú","Rafiki"], ok:0 },
  { peli:"Rey León", n:4, q:"¿Qué significa 'Hakuna Matata'?", op:["Sin preocupaciones","Buenos días","Hasta luego"], ok:0 },
  { peli:"Rey León", n:5, q:"¿Qué animal es Timón?", op:["Un suricato","Un mono","Un jabalí"], ok:0 },

  // Cars
  { peli:"Cars", n:1, q:"¿Cómo se llama el auto de carreras protagonista?", op:["Rayo McQueen","Mate","Sally"], ok:0 },
  { peli:"Cars", n:2, q:"¿De qué color es Rayo McQueen?", op:["Rojo","Azul","Verde"], ok:0 },
  { peli:"Cars", n:3, q:"¿Cómo se llama la grúa amiga de McQueen?", op:["Mate","Doc","Luigi"], ok:0 },
  { peli:"Cars", n:4, q:"¿En qué pueblo queda atrapado McQueen?", op:["Radiador Springs","Springfield","Ciudad Gótica"], ok:0 },
  { peli:"Cars", n:5, q:"¿Qué número lleva pintado Rayo McQueen?", op:["95","43","1"], ok:0 },

  // Monsters Inc
  { peli:"Monsters Inc", n:1, q:"¿Cómo se llama el monstruo grande y peludo azul?", op:["Sulley","Mike","Randall"], ok:0 },
  { peli:"Monsters Inc", n:2, q:"¿Cómo se llama el monstruo verde de un solo ojo?", op:["Mike Wazowski","Sulley","Randall"], ok:0 },
  { peli:"Monsters Inc", n:3, q:"¿Cómo se llama la niña que entra a su mundo?", op:["Boo","Riley","Dory"], ok:0 },
  { peli:"Monsters Inc", n:4, q:"¿Con qué generaban energía al principio?", op:["Gritos de niños","Risas de niños","Llanto"], ok:0 },
  { peli:"Monsters Inc", n:5, q:"¿Qué descubren que genera más energía?", op:["La risa","El silencio","El miedo"], ok:0 },

  // La Princesa y el Sapo
  { peli:"La Princesa y el Sapo", n:1, q:"¿En qué se convierte el príncipe Naveen?", op:["En un sapo","En un pájaro","En un perro"], ok:0 },
  { peli:"La Princesa y el Sapo", n:2, q:"¿Cómo se llama la protagonista?", op:["Tiana","Bella","Jasmín"], ok:0 },
  { peli:"La Princesa y el Sapo", n:3, q:"¿Qué sueña con abrir Tiana?", op:["Un restaurante","Una tienda","Una escuela"], ok:0 },
  { peli:"La Princesa y el Sapo", n:4, q:"¿En qué ciudad ocurre?", op:["Nueva Orleans","Nueva York","Miami"], ok:0 },
  { peli:"La Princesa y el Sapo", n:5, q:"¿Qué animal toca la trompeta?", op:["Un cocodrilo","Un mono","Un oso"], ok:0 },

  // Pocahontas
  { peli:"Pocahontas", n:1, q:"¿Cómo se llama el colono inglés que conoce?", op:["John Smith","Peter Pan","Eric"], ok:0 },
  { peli:"Pocahontas", n:2, q:"¿Cuál es la canción más famosa de la película?", op:["Colores en el viento","Bajo el mar","Hakuna Matata"], ok:0 },
  { peli:"Pocahontas", n:3, q:"¿Cómo se llama el mapache amigo de Pocahontas?", op:["Meeko","Flit","Percy"], ok:0 },
  { peli:"Pocahontas", n:4, q:"¿Quién es el árbol sabio que la aconseja?", op:["La Abuela Sauce","El roble","La ceiba"], ok:0 },
  { peli:"Pocahontas", n:5, q:"¿Qué animal es Flit?", op:["Un colibrí","Un águila","Un loro"], ok:0 },

  // Peter Pan
  { peli:"Peter Pan", n:1, q:"¿Cómo se llama el lugar donde nunca creces?", op:["Nunca Jamás","País de las Maravillas","Narnia"], ok:0 },
  { peli:"Peter Pan", n:2, q:"¿Cómo se llama el hada amiga de Peter?", op:["Campanita","Aurora","Wendy"], ok:0 },
  { peli:"Peter Pan", n:3, q:"¿Quién es el enemigo de Peter Pan?", op:["El Capitán Garfio","Scar","Úrsula"], ok:0 },
  { peli:"Peter Pan", n:4, q:"¿A qué le tiene miedo el Capitán Garfio?", op:["A un cocodrilo","A un león","A las arañas"], ok:0 },
  { peli:"Peter Pan", n:5, q:"¿Qué necesitás para volar según Peter Pan?", op:["Polvo de hada y pensar cosas felices","Alas","Una capa"], ok:0 },

  // Blancanieves
  { peli:"Blancanieves", n:1, q:"¿Cuántos enanitos viven en la casa?", op:["Siete","Cinco","Tres"], ok:0 },
  { peli:"Blancanieves", n:2, q:"¿Con qué envenenan a Blancanieves?", op:["Una manzana","Una pera","Un pastel"], ok:0 },
  { peli:"Blancanieves", n:3, q:"¿Cómo despierta Blancanieves?", op:["Con el beso de un príncipe","Con agua","Con un grito"], ok:0 },
  { peli:"Blancanieves", n:4, q:"¿Quién quiere hacerle daño?", op:["La Reina Malvada","Maléfica","Úrsula"], ok:0 },
  { peli:"Blancanieves", n:5, q:"¿Qué le pregunta la reina al espejo mágico?", op:["Quién es la más bella","Qué hora es","Dónde está el tesoro"], ok:0 },

  // Winnie the Pooh
  { peli:"Winnie the Pooh", n:1, q:"¿Qué le encanta comer a Winnie Pooh?", op:["Miel","Zanahorias","Bananas"], ok:0 },
  { peli:"Winnie the Pooh", n:2, q:"¿Cómo se llama el tigre saltarín?", op:["Tigger","Piglet","Rito"], ok:0 },
  { peli:"Winnie the Pooh", n:3, q:"¿Qué animal es Piglet?", op:["Un cerdito","Un conejo","Un oso"], ok:0 },
  { peli:"Winnie the Pooh", n:4, q:"¿Qué animal es Igor (Eeyore)?", op:["Un burro","Un cerdo","Un tigre"], ok:0 },
  { peli:"Winnie the Pooh", n:5, q:"¿En qué bosque viven?", op:["De los Cien Acres","Encantado","La selva"], ok:0 },

  // Aladdín
  { peli:"Aladdín", n:1, q:"¿Qué sale de la lámpara mágica?", op:["Un genio","Un dragón","Un hada"], ok:0 },
  { peli:"Aladdín", n:2, q:"¿Cómo se llama la princesa?", op:["Jasmín","Aurora","Bella"], ok:0 },
  { peli:"Aladdín", n:3, q:"¿Cuántos deseos concede el genio?", op:["Tres","Uno","Diez"], ok:0 },
  { peli:"Aladdín", n:4, q:"¿Sobre qué vuelan Aladdín y Jasmín?", op:["Una alfombra mágica","Una nube","Un dragón"], ok:0 },
  { peli:"Aladdín", n:5, q:"¿Cómo se llama el tigre mascota de Jasmín?", op:["Rajá","Abú","Sahara"], ok:0 },

  // Cenicienta
  { peli:"Cenicienta", n:1, q:"¿Qué pierde Cenicienta en el baile?", op:["Un zapato","Un guante","Una corona"], ok:0 },
  { peli:"Cenicienta", n:2, q:"¿De qué material es el zapato?", op:["De cristal","De oro","De madera"], ok:0 },
  { peli:"Cenicienta", n:3, q:"¿A qué hora termina la magia?", op:["A medianoche","Al amanecer","A las 10"], ok:0 },
  { peli:"Cenicienta", n:4, q:"¿Quién la ayuda a ir al baile?", op:["Su hada madrina","Su mamá","Una bruja"], ok:0 },
  { peli:"Cenicienta", n:5, q:"¿En qué se transforma la calabaza?", op:["En un carruaje","En un caballo","En un castillo"], ok:0 },

  // Coco
  { peli:"Coco", n:1, q:"¿Cómo se llama el protagonista?", op:["Miguel","Héctor","Ernesto"], ok:0 },
  { peli:"Coco", n:2, q:"¿Qué festividad mexicana aparece?", op:["El Día de los Muertos","Navidad","Halloween"], ok:0 },
  { peli:"Coco", n:3, q:"¿Qué le encanta hacer a Miguel?", op:["Tocar música","Cocinar","Pintar"], ok:0 },
  { peli:"Coco", n:4, q:"¿Cuál es la canción más famosa?", op:["Recuérdame","Libre soy","Bajo el mar"], ok:0 },
  { peli:"Coco", n:5, q:"¿Cómo se llama el ídolo de Miguel que resulta ser el villano?", op:["Ernesto de la Cruz","Héctor Rivera","Juan Ortodoncia"], ok:0 },

  // Dumbo
  { peli:"Dumbo", n:1, q:"¿Qué animal es Dumbo?", op:["Un elefante","Un ratón","Un oso"], ok:0 },
  { peli:"Dumbo", n:2, q:"¿Qué tiene de especial Dumbo?", op:["Sus grandes orejas","Su trompa larga","Su color"], ok:0 },
  { peli:"Dumbo", n:3, q:"¿Para qué le sirven las orejas a Dumbo?", op:["Para volar","Para nadar","Para escuchar lejos"], ok:0 },
  { peli:"Dumbo", n:4, q:"¿Dónde trabaja Dumbo?", op:["En un circo","En un zoológico","En una granja"], ok:0 },
  { peli:"Dumbo", n:5, q:"¿Qué aves convencen a Dumbo de que puede volar?", op:["Los cuervos","Las palomas","Los flamencos"], ok:0 },

  // 101 Dálmatas
  { peli:"101 Dálmatas", n:1, q:"¿Qué raza de perros son los protagonistas?", op:["Dálmatas","Labradores","Chihuahuas"], ok:0 },
  { peli:"101 Dálmatas", n:2, q:"¿Cómo se llama la villana?", op:["Cruella de Vil","Úrsula","Maléfica"], ok:0 },
  { peli:"101 Dálmatas", n:3, q:"¿Qué quiere hacer Cruella con los perritos?", op:["Un abrigo de piel","Venderlos","Un circo"], ok:0 },
  { peli:"101 Dálmatas", n:4, q:"¿De qué color son las manchas de los dálmatas?", op:["Negras","Marrones","Grises"], ok:0 },
  { peli:"101 Dálmatas", n:5, q:"¿Cómo nacen los cachorros al principio?", op:["Todos blancos","Con manchas","Negros"], ok:0 },

  // Maléfica
  { peli:"Maléfica", n:1, q:"¿Qué es Maléfica?", op:["Un hada","Una sirena","Una princesa"], ok:0 },
  { peli:"Maléfica", n:2, q:"¿A qué princesa maldice?", op:["A Aurora","A Cenicienta","A Bella"], ok:0 },
  { peli:"Maléfica", n:3, q:"¿En qué se transforma Maléfica en la batalla?", op:["En un dragón","En un lobo","En una serpiente"], ok:0 },
  { peli:"Maléfica", n:4, q:"¿Con qué se pincha Aurora según la maldición?", op:["Con una rueca","Con una espada","Con una flecha"], ok:0 },
  { peli:"Maléfica", n:5, q:"¿Qué animal acompaña a Maléfica?", op:["Un cuervo","Un gato","Un búho"], ok:0 },

  // La Bella y la Bestia
  { peli:"La Bella y la Bestia", n:1, q:"¿Cómo se llama la protagonista?", op:["Bella","Aurora","Ariel"], ok:0 },
  { peli:"La Bella y la Bestia", n:2, q:"¿En qué se convirtió el príncipe?", op:["En una bestia","En un sapo","En un lobo"], ok:0 },
  { peli:"La Bella y la Bestia", n:3, q:"¿Qué le encanta hacer a Bella?", op:["Leer libros","Cantar","Bailar"], ok:0 },
  { peli:"La Bella y la Bestia", n:4, q:"¿Qué flor marca el tiempo del hechizo?", op:["Una rosa","Un tulipán","Un girasol"], ok:0 },
  { peli:"La Bella y la Bestia", n:5, q:"¿Qué objeto encantado es Lumière?", op:["Un candelabro","Un reloj","Una tetera"], ok:0 },

  // La Sirenita
  { peli:"La Sirenita", n:1, q:"¿Cómo se llama la sirenita?", op:["Ariel","Moana","Aurora"], ok:0 },
  { peli:"La Sirenita", n:2, q:"¿Qué quiere tener Ariel para vivir en tierra?", op:["Piernas","Alas","Una corona"], ok:0 },
  { peli:"La Sirenita", n:3, q:"¿Cómo se llama la bruja del mar?", op:["Úrsula","Maléfica","Cruella"], ok:0 },
  { peli:"La Sirenita", n:4, q:"¿Qué animal es Sebastián?", op:["Un cangrejo","Un pez","Un pulpo"], ok:0 },
  { peli:"La Sirenita", n:5, q:"¿Cómo se llama el pez amigo de Ariel?", op:["Flounder","Nemo","Dory"], ok:0 },

  // Lilo & Stitch
  { peli:"Lilo & Stitch", n:1, q:"¿Cómo se llama la niña que adopta a Stitch?", op:["Lilo","Moana","Boo"], ok:0 },
  { peli:"Lilo & Stitch", n:2, q:"¿En qué lugar viven Lilo y Stitch?", op:["En Hawái","En México","En París"], ok:0 },
  { peli:"Lilo & Stitch", n:3, q:"¿Qué es Stitch en realidad?", op:["Un extraterrestre","Un perro","Un robot"], ok:0 },
  { peli:"Lilo & Stitch", n:4, q:"¿Qué significa 'Ohana'?", op:["Familia","Amigo","Amor"], ok:0 },
  { peli:"Lilo & Stitch", n:5, q:"¿Qué número de experimento es Stitch?", op:["626","101","7"], ok:0 },
];

/* Etiquetas de dificultad por nivel */
const NIVELES = {
  1: { txt:"Muy fácil",   estrellas:1 },
  2: { txt:"Fácil",       estrellas:2 },
  3: { txt:"Media",       estrellas:3 },
  4: { txt:"Difícil",     estrellas:4 },
  5: { txt:"Muy difícil", estrellas:5 },
};

/* ============================================================
   COMODINES · cartas locas para el reel
   Se inyectan al azar en la ronda (1, a veces 2 por participante).
   Pensadas para incomodar, divertir, asustar o hacer dudar —
   no para medir quién sabe más.
   cat: trampa | absurda | personal | reto
   - trampa: tiene respuesta real pero contraintuitiva (puede errar)
   - libre:true → cualquier opción cuenta como correcta (figu asegurada,
     el valor está en la reacción frente a cámara)
   ============================================================ */
const COMODINES = [
  // ---- TRAMPAS (respuesta real, pero te hacen dudar) ----
  { cat:"trampa", peli:"Blancanieves", q:"¿Cuál de estos NO es uno de los siete enanitos?", op:["Gruñón","Feliz","Chistoso"], ok:2 },
  { cat:"trampa", peli:"Coco", q:"En la película, ¿quién es realmente 'Coco'?", op:["La bisabuela de Miguel","El perro Dante","La guitarra"], ok:0 },
  { cat:"trampa", peli:"Disney/Pixar", q:"¿Cuál de estas NO es una película de Pixar?", op:["La Sirenita","Coco","Cars"], ok:0 },
  { cat:"trampa", peli:"Princesas", q:"¿Cuál de estas princesas es la MÁS JOVEN?", op:["Blancanieves (14)","Jasmín (15)","Ariel (16)"], ok:0 },
  { cat:"trampa", peli:"Aladdín", q:"¿Cuántas cosas NO te puede conceder el Genio, aunque se lo ruegues?", op:["3","1","Ninguna, hace todo"], ok:0 },
  { cat:"trampa", peli:"Rey León", q:"Mufasa es, de Simba, su...", op:["Papá","Abuelo","Tío"], ok:0 },
  { cat:"trampa", peli:"101 Dálmatas", q:"Tenés 3 segundos: nombrá un cachorro de los 101 dálmatas.", op:["Lucky","Spot","Firulais"], ok:0 },
  { cat:"trampa", peli:"Varias", q:"¿Cuál de estos personajes MUERE en su película?", op:["Mufasa","Aladdín","Hércules"], ok:0 },
  { cat:"trampa", peli:"La Sirenita", q:"Úrsula, la bruja del mar, es mitad mujer y mitad...", op:["Pulpo","Tiburón","Serpiente"], ok:0 },
  { cat:"trampa", peli:"Peter Pan", q:"¿Qué parte del cuerpo perdió el Capitán Garfio?", op:["La mano","Una pierna","Un ojo"], ok:0 },

  // ---- ABSURDAS (no hay respuesta real, ganás igual) ----
  { cat:"absurda", peli:"Lilo & Stitch", q:"Si Stitch fuera un electrodoméstico, ¿cuál sería?", op:["Una licuadora con patas","Un microondas","Un ventilador roto"], libre:true },
  { cat:"absurda", peli:"Disney", q:"¿Quién es más alto, Mickey Mouse o Stitch?", op:["Mickey","Stitch","Miden exactamente igual"], libre:true },
  { cat:"absurda", peli:"Cars", q:"Si Rayo McQueen choca con Mate, ¿quién paga el seguro?", op:["McQueen","Mate","La mesa de al lado"], libre:true },
  { cat:"absurda", peli:"Ratatouille", q:"¿Comerías un plato cocinado por Remy, la rata?", op:["Sí, sin dudar","Solo si no miro","Ni muerto"], libre:true },
  { cat:"absurda", peli:"Varias", q:"En una pelea sin reglas: ¿Simba adulto o Stitch?", op:["Simba","Stitch","Stitch porque es alien"], libre:true },

  // ---- PERSONALES (a cámara, te exponen) ----
  { cat:"personal", peli:"Rey León", q:"Sé honesto a cámara: ¿lloraste con la muerte de Mufasa?", op:["Sí, obvio","No (mentira)","Todavía lloro"], libre:true },
  { cat:"personal", peli:"Disney", q:"Mirá a cámara y confesá: ¿quién fue tu Disney crush?", op:["Lo digo sin vergüenza","Me pongo rojo","Paso a la siguiente"], libre:true },
  { cat:"personal", peli:"Villanos", q:"¿Con cuál de estos villanos te irías de joda?", op:["Úrsula","Cruella","Capitán Garfio"], libre:true },
  { cat:"personal", peli:"Maléfica", q:"¿Quién es más villano: tu ex o Maléfica?", op:["Mi ex, lejos","Maléfica","Empatan"], libre:true },
  { cat:"personal", peli:"Disney", q:"Si tu vida fuera una peli Disney, ¿cuál sería?", op:["Enredados","El Rey León","Coco"], libre:true },
  { cat:"personal", peli:"Aladdín", q:"El Genio te da 3 deseos. El primero que pedís es...", op:["Plata","Amor","Más deseos (tramposo)"], libre:true },

  // ---- RETOS (performance a cámara) ----
  { cat:"reto", peli:"Rey León", q:"Imitá el rugido de Simba ahora mismo, mirando a cámara.", op:["Lo hago full","Versión tímida","Me niego rotundamente"], libre:true },
  { cat:"reto", peli:"Aladdín", q:"Cantá un pedazo de 'Un mundo ideal'. Ya, sin vueltas.", op:["La rompo cantando","Solo el estribillo","Ni en pedo"], libre:true },
  { cat:"reto", peli:"Coco", q:"Cantá 'Recuérdame' como si fuera tu última canción.", op:["Emociono a todos","Bajito","Que cante otro"], libre:true },
  { cat:"reto", peli:"Moana", q:"Bailá 3 segundos como si estuvieras en la isla de Moana.", op:["Me suelto entero","Solo los hombros","Me quedo quieto"], libre:true },
  { cat:"reto", peli:"Frozen", q:"Cantá 'Libre soy' en la nota más alta que puedas.", op:["Rompo vidrios","Medio tono nomás","Me rajo corriendo"], libre:true },
];

/* Etiquetas visuales de cada categoría de comodín */
const CATS = {
  trampa:   { txt:"Trampa",   emoji:"🤔" },
  absurda:  { txt:"Absurda",  emoji:"🤪" },
  personal: { txt:"A cámara", emoji:"🎬" },
  reto:     { txt:"Reto",     emoji:"🔥" },
};

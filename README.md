# Simulador 3D de las Leyes de Newton

Este es un simulador interactivo en 3D construido para demostrar las tres leyes del movimiento de Newton de una manera visual y didáctica. Cada ley se presenta en una escena separada, permitiendo al usuario experimentar con los conceptos físicos fundamentales.

## Librerías Utilizadas

- **[Three.js](https://threejs.org/):** Una librería de JavaScript para crear y mostrar gráficos 3D animados en un navegador web. Se utiliza para todo el renderizado visual, incluyendo los objetos, la iluminación y las sombras.
- **[cannon-es](https://pmndrs.github.io/cannon-es/):** Un motor de física 3D escrito en JavaScript. Se encarga de simular la física del mundo real, como la gravedad, las colisiones, las fuerzas y la inercia.

---

## Las Tres Leyes de Newton

Puedes cambiar entre las escenas usando los botones en el panel de control.

### 1ª Ley: Inercia

> "Un objeto permanecerá en reposo o en movimiento rectilíneo uniforme a menos que una fuerza externa actúe sobre él."

En esta escena se muestran dos esferas:
- Una **esfera azul** en reposo.
- Una **esfera verde** en movimiento constante.

Ambas mantendrán su estado indefinidamente sobre la plataforma.

**Controles:**
- Presiona la tecla **`F`** para aplicar una fuerza a la esfera azul y observar cómo se rompe su estado de inercia.

### 2ª Ley: Fuerza = masa × aceleración (F=ma)

> "La aceleración de un objeto es directamente proporcional a la fuerza neta que actúa sobre él e inversamente proporcional a su masa."

Esta escena te permite experimentar con la relación entre fuerza, masa y aceleración.

**Controles:**
- **Fuerza (N):** Define la magnitud de la fuerza (en Newtons) que se aplicará.
- **Masa 1, 2, 3 (kg):** Define la masa de cada una de las tres esferas. El tamaño de las esferas cambiará para reflejar visualmente su masa.
- **Botón "Aplicar y Reiniciar":** Carga la simulación con los nuevos valores de fuerza y masa. La aceleración resultante para cada esfera se calcula y muestra automáticamente.
- Presiona la tecla **`F`** para aplicar la misma fuerza a todas las esferas simultáneamente. Observarás que las esferas con menor masa aceleran más rápido.

### 3ª Ley: Acción y Reacción

> "Para cada acción, existe una reacción igual y opuesta."

Esta escena demuestra el principio de acción y reacción a través de una colisión. Dos esferas con la misma masa se mueven una hacia la otra a la misma velocidad.

Al chocar, la fuerza que la primera esfera ejerce sobre la segunda es igual en magnitud y opuesta en dirección a la fuerza que la segunda ejerce sobre la primera. El resultado es que ambas rebotan y se alejan a la misma velocidad con la que llegaron.

**Controles:**
- Presiona la tecla **`R`** para reiniciar la simulación y ver la colisión de nuevo.

---

## Estructura del Código

- **`index.html`:** La estructura base de la página web. Carga las librerías de Three.js y cannon-es, y contiene el panel de información y los botones para seleccionar las escenas.
- **`styles.css`:** Contiene todos los estilos para el panel de control, los botones y los campos de entrada, asegurando una interfaz limpia y ordenada.
- **`main.js`:** El corazón del simulador.
  - Utiliza una clase principal `NewtonGame` para encapsular toda la lógica.
  - Gestiona la creación de la escena 3D, la cámara y el renderizador.
  - Implementa un gestor de escenas (`loadScene`) que limpia y configura el entorno para cada una de las tres leyes.
  - Las funciones `setupLaw1`, `setupLaw2` y `setupLaw3` contienen la lógica específica para crear los objetos y la interactividad de cada demostración.
  - El bucle `animate` actualiza el motor de física y renderiza cada fotograma.

## Cómo Empezar

Simplemente abre el archivo `index.html` en un navegador web moderno (como Chrome, Firefox o Safari). No se requiere ningún servidor ni pasos de compilación.

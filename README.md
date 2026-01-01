# Mini Framework Documentation

This is a lightweight, custom JavaScript framework designed to build Single Page Applications (SPAs). It features a Virtual DOM, component-based architecture, hooks for state management, and a simple hash-based router.

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Architecture & Concepts](#architecture--concepts)
    - [Virtual DOM (VDOM)](#virtual-dom-vdom)
    - [The `h` Function](#the-h-function)
    - [Reconciliation (Diffing)](#reconciliation-diffing)
    - [Rendering Process](#rendering-process)
5. [API Reference](#api-reference)
    - [Core Functions](#core-functions)
        - [`render`](#render)
        - [`h`](#h)
    - [Hooks](#hooks)
        - [`useState`](#usestate)
        - [`useEffect`](#useeffect)
    - [Router](#router)
        - [`Router` Class](#router-class)
        - [`useHash`](#usehash)
        - [`Link`](#link)
6. [Component Guide](#component-guide)
    - [Functional Components](#functional-components)
    - [Class Components](#class-components)
    - [Props & Children](#props--children)
    - [Event Handling](#event-handling)
    - [Lists & Keys](#lists--keys)
7. [Advanced Usage](#advanced-usage)
    - [Security (XSS Prevention)](#security-xss-prevention)
    - [Project Structure](#project-structure)

---

## Introduction

The Mini Framework is built to provide a React-like experience with a minimal footprint. It abstracts the DOM manipulation away from the developer, allowing you to focus on building declarative user interfaces.

Key Features:
- **Declarative UI**: Describe what your UI should look like, not how to update it.
- **Component-Based**: Build encapsulated components that manage their own state.
- **Hooks**: Use state and other features without writing classes.
- **Client-Side Routing**: Handle navigation without page reloads.

---

## Installation

To use the framework, import the core functions from `src/index.js` into your application. No npm installation is required if you have the source files.

```javascript
import { render, h, useState, useEffect } from './src/index.js';
import { Router, Link } from './src/router/index.js';
```

---

## Quick Start

Here is a minimal "Counter" application.

**index.html**
```html
<!DOCTYPE html>
<body>
    <div id="app"></div>
    <script type="module" src="app.js"></script>
</body>
```

**app.js**
```javascript
import { render, useState } from './src/index.js';

function Counter() {
    const [count, setCount] = useState(0);

    return {
        tag: 'div',
        attrs: { class: 'container' },
        children: [
            {
                tag: 'h1',
                children: [`Count: ${count}`]
            },
            {
                tag: 'button',
                attrs: { onClick: () => setCount(count + 1) },
                children: ['Increment']
            }
        ]
    };
}

render(Counter, document.getElementById('app'));
```

---

## Architecture & Concepts

### Virtual DOM (VDOM)

The Virtual DOM is a lightweight JavaScript object representation of the real DOM. Instead of manipulating the DOM directly (which is slow), the framework creates a tree of JavaScript objects (VNodes).

A VNode looks like this:
```javascript
{
    tag: 'div',          // HTML tag or Component Function/Class
    attrs: { id: 'foo' }, // Attributes/Props
    children: []         // Array of child VNodes or strings
}
```

### The `h` Function

The `h` (hyperscript) function is a helper to create these VNodes easily. While you can write raw objects, `h` ensures the structure is correct.

```javascript
h('div', { class: 'red' }, ['Hello'])
// Returns: { tag: 'div', attrs: { class: 'red' }, children: ['Hello'] }
```

### Reconciliation (Diffing)

When the state of a component changes, the framework creates a **new** VDOM tree. It then compares this new tree with the previous one to determine the minimal set of changes needed for the real DOM. This process is called **Diffing**.

**How it works:**
1.  **Tag Comparison**: If the tag changes (e.g., `div` to `span`), the entire node is replaced.
2.  **Props Comparison**: Attributes are updated only if they changed.
3.  **Children Comparison**:
    -   The framework iterates through lists of children.
    -   **Keys**: If you provide a unique `key` attribute in a list, the diffing algorithm can reorder elements instead of destroying/recreating them.

### Rendering Process

1.  **Initial Render**: The full VDOM tree is built and converted to real DOM nodes, then appended to the container.
2.  **Updates**: When `setState` is called:
    -   The `Scheduler` is triggered.
    -   The component re-executes to produce a new VNode.
    -   The `Diffing` engine updates the DOM.

---

## API Reference

### Core Functions

#### `render`
Mounts the application to the DOM.

-   **Signature**: `render(component, container)`
-   **Parameters**:
    -   `component`: The root Component (Function or Class).
    -   `container`: The DOM element where the app will be mounted.

#### `h`
Creates a Virtual DOM node.

-   **Signature**: `h(tag, attributes, children)`
-   **Parameters**:
    -   `tag`: String (HTML tag) or Function/Class (Component).
    -   `attributes`: Object of DOM attributes/props.
    -   `children`: Array of VNodes or strings.

### Hooks

#### `useState`
Manages local state in functional components.

-   **Signature**: `const [state, setState] = useState(initialValue)`
-   **Usage**:
    ```javascript
    const [count, setCount] = useState(0);
    setCount(1); // Set directly
    setCount(prev => prev + 1); // Functional update
    ```

#### `useEffect`
Performs side effects (data fetching, subscriptions, DOM manipulation).

-   **Signature**: `useEffect(callback, dependencies)`
-   **Parameters**:
    -   `callback`: Function that runs after render. Can return a cleanup function.
    -   `dependencies`: Array of values. Effect re-runs only if a value changes.
-   **Usage**:
    ```javascript
    useEffect(() => {
        const id = setInterval(tick, 1000);
        return () => clearInterval(id); // Cleanup
    }, []); // Empty array = run once on mount
    ```

### Router

#### `Router` Class
Manages the hash-based routing system.

-   **Methods**:
    -   `push(path)`: Navigates to the specified path. Automatically adds a leading slash if missing (e.g., `push('home')` -> `#/home`).

#### `useHash`
A hook that returns the current route hash (excluding the `#`). It triggers a re-render whenever the hash changes.

-   **Returns**: String (e.g., `/active`, `/completed`).

#### `Link`
A functional component for declarative navigation.

-   **Props**:
    -   `to`: The target path (e.g., `/about`).
    -   `...props`: Any other anchor attributes (class, id, etc.).
-   **Usage**:
    ```javascript
    {
        component: Link,
        props: { to: '/settings', class: 'nav-link' },
        children: ['Settings']
    }
    ```

---

## Component Guide

### Functional Components
The recommended way to build components. They are simple functions that return a VNode.

```javascript
function Button({ label, onClick }) {
    return {
        tag: 'button',
        attrs: { onClick },
        children: [label]
    };
}
```

### Class Components
Useful if you prefer object-oriented style. Must implement a `render` method and accept `props` in the constructor.

```javascript
class Welcome {
    constructor(props) {
        this.props = props;
    }
    render() {
        return { tag: 'h1', children: [`Hello, ${this.props.name}`] };
    }
}
```

### Props & Children
Data is passed down via `props`. Children elements are passed in the `children` array (conceptually similar to `props.children` in React).

### Event Handling
Events are passed as attributes starting with `on` (camelCase).
-   `onClick`
-   `onChange`
-   `onInput`
-   `onKeyDown`

The framework attaches these listeners directly to the DOM elements.

### Lists & Keys
When rendering a list of items, always provide a unique `key` attribute. This helps the diffing algorithm efficiently update the list.

```javascript
items.map(item => ({
    tag: 'li',
    attrs: { key: item.id }, // Crucial for performance
    children: [item.text]
}))
```

---

## Advanced Usage

### Security (XSS Prevention)
The framework does **not** automatically sanitize HTML strings. To prevent Cross-Site Scripting (XSS), you should sanitize user input before rendering it.

**Utility Helper**:
```javascript
import { escapeHTML } from './todoMVC/utils.js';

const safeText = escapeHTML(userInput);
```

### Project Structure
Recommended structure for a scalable application:

```
/
├── src/
│   ├── core/           # Framework internals
│   ├── router/         # Router logic
│   └── index.js        # Main export
├── components/         # Reusable UI components
├── pages/              # Route views
├── utils/              # Helper functions
├── app.js              # Root component
└── index.html          # Entry HTML
```

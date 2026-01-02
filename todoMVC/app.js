import { render, useState, useHash } from '../../src/index.js';
import { TodoHeader } from './components/todoHeader.js';
import { TodoList } from './components/todoList.js';
import { TodoFooter } from './components/todoFooter.js';

export const FILTERS = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
};

let __idCounter = 0;
const generateId = () => `${Date.now().toString(36)}_${(__idCounter++).toString(36)}`;

function TodoApp() {
    const [todos, setTodos] = useState([])
    const hash = useHash();

    const route = hash.replace('/', '') || FILTERS.ALL;
    const filter = Object.values(FILTERS).includes(route) ? route : FILTERS.ALL;

    const handleAddTodo = (text) => {
        setTodos([...todos, {
            id: generateId(),
            text,
            completed: false,
            editing: false
        }]);
    };

    const handleToggle = (id) => {
        setTodos(todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const handleToggleAll = (completed) => {
        setTodos(todos.map(todo => ({ ...todo, completed })));
    };

    const handleDeleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleToggleEditing = (id, editing) => {
        setTodos(todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, editing };
            }
            return todo;
        }));
    };

    const handleEditTodo = (id, text, editing = false) => {
        setTodos(todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text, editing };
            }
            return { ...todo, editing: false };
        }));
    };

    const handleClearCompleted = () => {
        setTodos(todos.filter(todo => !todo.completed));
    };

    const filteredTodos = todos.filter(todo => {
        switch (filter) {
            case FILTERS.ACTIVE:
                return !todo.completed;
            case FILTERS.COMPLETED:
                return todo.completed;
            default:
                return true;
        }
    });

    return {
        tag: 'fragment',
        attrs: {},
        children: [
            {
                tag: 'section',
                attrs: {
                    class: 'todoapp',
                    id: 'root'
                },
                children: [
                    {
                        component: TodoHeader,
                        props: {
                            addTodo: handleAddTodo
                        }
                    },
                    filteredTodos.length > 0 ? {
                        component: TodoList,
                        props: {
                            todos,
                            filteredTodos,
                            toggleTodo: handleToggle,
                            toggleAll: handleToggleAll,
                            deleteTodo: handleDeleteTodo,
                            editTodo: handleEditTodo,
                            toggleEditing: handleToggleEditing
                        }
                    } : null,
                    todos.length > 0 ? {
                        component: TodoFooter,
                        props: {
                            todos,
                            filter,
                            clearCompleted: handleClearCompleted
                        }
                    }: null
                ]
            },
            {
                tag: 'footer',
                attrs: {
                    class: 'info'
                },
                children: [
                    {
                        tag: 'p',
                        attrs: {},
                        children: ['Double-click to edit a todo']
                    },
                    {
                        tag: 'p',
                        attrs: {},
                        children: [
                            'Created by the TodoMVC Team'
                        ]
                    },
                    {
                        tag: 'p',
                        attrs: {},
                        children: [
                            'Part of ',
                            {
                                tag: 'a',
                                attrs: { href: 'http://todomvc.com' },
                                children: ['TodoMVC']
                            }
                        ]
                    }
                ]
            } 
        ]
    }
}

render(TodoApp, document.getElementById('app'));

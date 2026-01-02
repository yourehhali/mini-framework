import { escapeHTML } from '../utils.js';

export class TodoList {
    constructor({ todos, filteredTodos, toggleTodo, toggleAll, deleteTodo, editTodo, toggleEditing }) {
        this.todos = todos;
        this.filteredTodos = filteredTodos;
        this.toggleTodo = toggleTodo;
        this.toggleAll = toggleAll;
        this.deleteTodo = deleteTodo;
        this.editTodo = editTodo;
        this.toggleEditing = toggleEditing;
    }
    render() {
        const allCompleted = this.todos.length > 0 && this.todos.every(todo => todo.completed);
        return {
            tag: 'main',
            attrs: {
                class: 'main',
                'data-testid': 'main'
            },
            children: [
                ...(this.todos.length > 0 ? [
                    {
                        tag: 'div',
                        attrs: { class: 'toggle-all-container' },
                        children: [
                            {
                                tag: 'input',
                                attrs: {
                                    class: 'toggle-all',
                                    type: 'checkbox',
                                    id: 'toggle-all',
                                    "data-testid": "toggle-all",
                                    checked: allCompleted,
                                    onChange: (e) => this.toggleAll(e.target.checked)
                                },
                                children: ['Mark all as complete']
                            },
                            {
                                tag: 'label',
                                attrs: {
                                    class: 'toggle-all-label',
                                    htmlFor: 'toggle-all'
                                },
                                children: ['Toggle All Input']
                            }
                        ]
                    }
                ] : []),
                {
                    tag: 'ul',
                    attrs: {
                        class: 'todo-list',
                        'data-testid': 'todo-list'
                    },
                    children: this.filteredTodos.map(todo => ({
                        component: TodoItem,
                        props: {
                            key: todo.id,
                            todo,
                            toggleTodo: this.toggleTodo,
                            deleteTodo: this.deleteTodo,
                            editTodo: this.editTodo,
                            toggleEditing: this.toggleEditing
                        }
                    }))
                }
            ]
        };
    }
}

class TodoItem {
    constructor({ todo, toggleTodo, deleteTodo, editTodo, toggleEditing }) {
        this.todo = todo;
        this.toggleTodo = toggleTodo;
        this.deleteTodo = deleteTodo;
        this.editTodo = editTodo;
        this.toggleEditing = toggleEditing;
        this.isSubmitting = false;
    }
    handleToggle() {
        this.toggleTodo(this.todo.id);
    }
    handleDoubleClick() {
        this.toggleEditing(this.todo.id, true);
        setTimeout(() => {
            const input = document.querySelector('[data-testid="todo-item-edit-input"]');
            if (input) input.focus();
        }, 0);
    }
    handleDelete() {
        this.deleteTodo(this.todo.id);
    }
    handleBlur() {
        if (this.isSubmitting) return;
        this.toggleEditing(this.todo.id, false);
    }
    handleEdit(e) {
        if (e.key === "Enter") {
            const value = e.target.value.trim();
            if (value.length > 2) {
                this.isSubmitting = true;
                this.editTodo(this.todo.id, escapeHTML(value), false);
                setTimeout(() => {
                    this.isSubmitting = false;
                }, 0);
            }
        }
    }
    render() {
        const t = this.todo;
        return {
            tag: 'li',
            attrs: {
                class: t.completed ? 'completed' : '',
                'data-testid': 'todo-item'
            },
            children: [
                {
                    tag: 'div',
                    attrs: {
                        class: 'view'
                    },
                    children: t.editing ? [
                        {
                            tag: 'div',
                            attrs: { class: 'input-container' },
                            children: [
                                {
                                    tag: 'input',
                                    attrs: {
                                        class: 'new-todo',
                                        id: 'todo-edit-input',
                                        type: 'text',
                                        "data-testid": "todo-item-edit-input",
                                        autofocus: true,
                                        placeholder: 'Edit todo',
                                        defaultValue: t.text,
                                        onKeyDown: (e) => this.handleEdit(e),
                                        onBlur: () => this.handleBlur(),
                                    },
                                    children: []
                                },
                                {
                                    tag: 'label',
                                    attrs: {
                                        class: 'visually-hidden',
                                        htmlFor: 'todo-input'
                                    },
                                    children: ['Edit Todo Input']
                                }
                            ]
                        }
                    ] : [
                        {
                            tag: 'input',
                            attrs: {
                                class: 'toggle',
                                type: 'checkbox',
                                'data-testid': "todo-item-toggle",
                                checked: t.completed,
                                onChange: () => this.handleToggle()
                            },
                            children: []
                        },
                        {
                            tag: 'label',
                            attrs: {
                                "data-testid": "todo-item-label",
                                onDblclick: () => this.handleDoubleClick(),
                            },
                            children: [t.text]
                        },
                        {
                            tag: 'button',
                            attrs: {
                                class: 'destroy',
                                "data-testid": "todo-item-button",
                                onClick: () => this.handleDelete()
                            },
                            children: []
                        }
                    ]
                }
            ]
        };
    }
}

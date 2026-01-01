import { escapeHTML } from '../utils.js';

export class TodoHeader {
    constructor({ addTodo }) {
        this.addTodo = addTodo;
    }
    handleSubmit(e) {
        if (e.key === "Enter") {
            const value = e.target.value.trim();
            if (value.length > 2) {
                this.addTodo(escapeHTML(value));
                e.target.value = '';
            }
        }
    }
    render() {
        return {
            tag: 'header',
            attrs: {
                class: 'header',
                'data-testid': 'header'
            },
            children: [
                {
                    tag: 'h1',
                    attrs: {},
                    children: ['todos']
                },
                {
                    tag: 'div',
                    attrs: {
                        class: 'input-container'
                    },
                    children: [
                        {
                            tag: 'input',
                            attrs: {
                                class: 'new-todo',
                                id: 'todo-input',
                                type: 'text',
                                'data-testid': 'text-input',
                                autofocus: true,
                                placeholder: 'What needs to be done?',
                                onKeyDown: (e) => this.handleSubmit(e),
                            },
                            children: []
                        },
                        {
                            tag: 'label',
                            attrs: {
                                class: 'visually-hidden',
                                htmlFor: 'todo-input'
                            },
                            children: ['New Todo Input']
                        }
                    ]
                }
            ]
        };
    }
}

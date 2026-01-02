import { FILTERS } from "../app.js";

export class TodoFooter {
    constructor({ todos, filter, clearCompleted }) {
        this.todos = todos;
        this.filter = filter;
        this.clearCompleted = clearCompleted;
    }
    render() {
        const activeTodoCount = this.todos.filter(todo => !todo.completed).length;
        return {
            tag: 'footer',
            attrs: {
                class: 'footer',
                "data-testid": "footer"
            },
            children: [
                {
                    tag: 'span',
                    attrs: { class: 'todo-count' },
                    children: [
                        `${activeTodoCount.toString()} item${activeTodoCount !== 1 ? 's' : ''} left!`
                    ]
                },
                {
                    tag: 'ul',
                    attrs: {
                        class: 'filters',
                        "data-testid": "footer-navigation"
                    },
                    children: [
                        {
                            tag: 'li',
                            attrs: {},
                            children: [
                                {
                                    tag: 'a',
                                    attrs: {
                                        href: '#/',
                                        class: this.filter === FILTERS.ALL ? 'selected' : '',
                                    },
                                    children: ['All']
                                }
                            ]
                        },
                        {
                            tag: 'li',
                            attrs: {},
                            children: [
                                {
                                    tag: 'a',
                                    attrs: {
                                        href: '#/active',
                                        class: this.filter === FILTERS.ACTIVE ? 'selected' : '',
                                    },
                                    children: ['Active']
                                }
                            ]
                        },
                        {
                            tag: 'li',
                            attrs: {},
                            children: [
                                {
                                    tag: 'a',
                                    attrs: {
                                        href: '#/completed',
                                        class: this.filter === FILTERS.COMPLETED ? 'selected' : '',
                                    },
                                    children: ['Completed']
                                }
                            ]
                        }
                    ]
                },
                {
                    tag: 'button',
                    attrs: {
                        class: 'clear-completed',
                        onClick: () => this.clearCompleted(),
                        disabled: activeTodoCount === this.todos.length,
                    },
                    children: ['Clear completed']
                }
            ]
        };
    }
}

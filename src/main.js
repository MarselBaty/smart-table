import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import { initSearching } from "./components/searching.js";
import {initPagination} from './components/pagination.js';
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
// @todo: подключение


const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);
    return {  // расширьте существующий return вот так
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let query= {};
    query = applyPagination(query, state, action);
    query = applyFiltering(query, state, action); // result заменяем на query
    query = applySearching(query, state, action); // result заменяем на query
    query = applySorting(query, state, action); // result заменяем на query
    // @todo: использование
    const { total, items } = await api.getRecords(query);
    updatePagination(total, query); // перерисовываем пагинатор
    sampleTable.render(items);
}
async function init() {
    const indexes = await api.getIndexes();
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
    render()
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ["header", "filter", "search"],
    after: ['pagination']
}, render);

// @todo: инициализация
const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);
const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);
const applySearching = initSearching(
    sampleTable.header.elements.search
)
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);
render();
init();
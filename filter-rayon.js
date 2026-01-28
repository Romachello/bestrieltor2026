// Оценки районов по 10 критериям
const districtRatings = {
   'admiralteyskiy': { price: 9, ecology: 6, infrastructure: 8, transport: 9, education: 8, medicine: 7, age: 3, safety: 7, employment: 8, traffic: 8 },
   'vasileostrovskiy': { price: 7, ecology: 7, infrastructure: 7, transport: 8, education: 7, medicine: 6, age: 4, safety: 7, employment: 6, traffic: 7 },
   'petrogradskiy': { price: 8, ecology: 7, infrastructure: 8, transport: 8, education: 8, medicine: 7, age: 4, safety: 8, employment: 7, traffic: 7 },
   'vyborgskiy': { price: 5, ecology: 5, infrastructure: 6, transport: 7, education: 6, medicine: 5, age: 5, safety: 6, employment: 6, traffic: 6 },
   'kalininskiy': { price: 4, ecology: 4, infrastructure: 7, transport: 8, education: 7, medicine: 6, age: 6, safety: 6, employment: 7, traffic: 7 },
   'kirovskiy': { price: 3, ecology: 3, infrastructure: 6, transport: 7, education: 5, medicine: 5, age: 5, safety: 5, employment: 5, traffic: 6 },
   'moskovskiy': { price: 5, ecology: 5, infrastructure: 8, transport: 9, education: 7, medicine: 7, age: 6, safety: 7, employment: 7, traffic: 8 },
   'nevskiy': { price: 4, ecology: 4, infrastructure: 8, transport: 9, education: 7, medicine: 6, age: 5, safety: 6, employment: 7, traffic: 8 },
   'frunzenskiy': { price: 5, ecology: 5, infrastructure: 7, transport: 8, education: 6, medicine: 6, age: 6, safety: 7, employment: 6, traffic: 7 },
   'primorskiy': { price: 7, ecology: 8, infrastructure: 8, transport: 7, education: 7, medicine: 7, age: 8, safety: 8, employment: 7, traffic: 6 },
   'krasnogvardeiskiy': { price: 4, ecology: 5, infrastructure: 7, transport: 7, education: 6, medicine: 5, age: 7, safety: 6, employment: 6, traffic: 6 },
   'krasnoselskiy': { price: 6, ecology: 7, infrastructure: 7, transport: 6, education: 6, medicine: 6, age: 8, safety: 7, employment: 6, traffic: 5 },
   'kolpinskiy': { price: 2, ecology: 6, infrastructure: 5, transport: 4, education: 5, medicine: 4, age: 5, safety: 6, employment: 4, traffic: 4 },
   'pushkinskiy': { price: 6, ecology: 9, infrastructure: 6, transport: 5, education: 6, medicine: 5, age: 5, safety: 8, employment: 5, traffic: 4 },
   'kurortnyy': { price: 5, ecology: 9, infrastructure: 5, transport: 3, education: 4, medicine: 4, age: 5, safety: 8, employment: 3, traffic: 3 },
   'petrodvortsovyy': { price: 6, ecology: 8, infrastructure: 5, transport: 4, education: 5, medicine: 4, age: 4, safety: 8, employment: 4, traffic: 4 },
   'kronshtadtskiy': { price: 3, ecology: 8, infrastructure: 4, transport: 3, education: 4, medicine: 4, age: 4, safety: 7, employment: 4, traffic: 3 },
   'tsentralnyy': { price: 9, ecology: 6, infrastructure: 9, transport: 9, education: 9, medicine: 8, age: 3, safety: 7, employment: 9, traffic: 9 }
};

document.addEventListener('DOMContentLoaded', function() {
   // Основные переменные
   let activeDistrict = null;
   let hoveredDistrict = null;
   let preloadedImages = {};
   let isMobile = window.innerWidth < 768;
   let switchTimeout = null;
   let hoverTimeout = null;
   
   // Элементы DOM
   const districtsList = document.getElementById('districts-list');
   const cardsContainer = document.getElementById('districts-info');
   const mainMap = document.getElementById('district-main-map');
   const mapsContainer = document.getElementById('district-maps-container');
   const loadingIndicator = document.getElementById('map-loading');
   const filterSelects = document.querySelectorAll('.filter-select');
   const resetFiltersBtn = document.getElementById('reset-filters-btn');
   const filterResultsContainer = document.getElementById('filter-results-container');
   const filteredDistrictsList = document.getElementById('filtered-districts-list');
   const filterResultsCount = document.getElementById('filter-results-count');
   const activeResultsCount = document.getElementById('active-results-count');
   
   // ==================== ФУНКЦИИ ФИЛЬТРАЦИИ ====================
   
   // Функция проверки соответствия района фильтрам
   function checkDistrictFilters(districtId) {
       const ratings = districtRatings[districtId];
       if (!ratings) return true;
       
       // Проверяем каждый фильтр
       for (const select of filterSelects) {
           const filterName = select.dataset.filter;
           const filterValue = parseInt(select.value);
           
           // Если фильтр не активен, пропускаем
           if (filterValue === 0) continue;
           
           const districtRating = ratings[filterName];
           
           // Для цены и пробок: район должен иметь оценку НЕ ВЫШЕ выбранной
           if (filterName === 'price' || filterName === 'traffic') {
               if (districtRating > filterValue) {
                   return false;
               }
           } 
           // Для остальных критериев: район должен иметь оценку НЕ НИЖЕ выбранной
           else {
               if (districtRating < filterValue) {
                   return false;
               }
           }
       }
       
       return true;
   }
   
   // Функция применения фильтров
   function applyFilters() {
       console.log('Применение фильтров...');
       
       const matchingDistricts = [];
       const activeFilters = Array.from(filterSelects).filter(select => parseInt(select.value) > 0);
       
       // Проверяем каждый район
       districts.forEach(district => {
           if (checkDistrictFilters(district.id)) {
               matchingDistricts.push(district);
           }
       });
       
       // Обновляем счетчики
       const matchCount = matchingDistricts.length;
       filterResultsCount.textContent = `${matchCount} ${getWordForm(matchCount, ['район', 'района', 'районов'])}`;
       activeResultsCount.textContent = matchCount;
       
       // Показываем/скрываем блок результатов
       if (activeFilters.length > 0) {
           filterResultsContainer.classList.remove('hidden');
           updateFilteredList(matchingDistricts);
       } else {
           filterResultsContainer.classList.add('hidden');
       }
       
       // Подсвечиваем районы в основном списке
       highlightFilteredDistricts(matchingDistricts);
   }
   
   // Функция обновления списка отфильтрованных районов
   function updateFilteredList(matchingDistricts) {
       filteredDistrictsList.innerHTML = '';
       
       if (matchingDistricts.length === 0) {
           filteredDistrictsList.innerHTML = `
               <div class="text-center py-8">
                   <i class="fas fa-search text-gray-400 text-4xl mb-3"></i>
                   <p class="text-gray-700 font-medium">Ни один район не соответствует критериям</p>
                   <p class="text-gray-500 text-sm mt-1">Измените значения фильтров</p>
               </div>
           `;
           return;
       }
       
       matchingDistricts.forEach((district, index) => {
           const ratings = districtRatings[district.id];
           const avgScore = calculateAverageScore(ratings);
           
           const item = document.createElement('div');
           item.className = 'filtered-district-item bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow cursor-pointer transition-all duration-200';
           item.dataset.districtId = district.id;
           item.innerHTML = `
               <div class="flex items-center">
                   <div class="flex-shrink-0 mr-4">
                       <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                           ${index + 1}
                       </div>
                   </div>
                   <div class="flex-grow">
                       <div class="flex justify-between items-center mb-1">
                           <h4 class="font-bold text-gray-800">${district.name}</h4>
                           <span class="text-sm font-bold px-2 py-1 ${getScoreColor(avgScore)} rounded">
                               ${avgScore.toFixed(1)}
                           </span>
                       </div>
                       <div class="text-sm text-gray-600 mb-2">
                           ${district.area} • ${district.population}
                       </div>
                       <div class="flex flex-wrap gap-1">
                           <span class="text-xs px-2 py-1 ${getRatingColorClass(ratings.price, 'price')} rounded">
                               Цена: ${ratings.price}/10
                           </span>
                           <span class="text-xs px-2 py-1 ${getRatingColorClass(ratings.ecology)} rounded">
                               Экология: ${ratings.ecology}/10
                           </span>
                           <span class="text-xs px-2 py-1 ${getRatingColorClass(ratings.transport)} rounded">
                               Транспорт: ${ratings.transport}/10
                           </span>
                       </div>
                   </div>
                   <div class="ml-2">
                       <i class="fas fa-chevron-right text-gray-400"></i>
                   </div>
               </div>
           `;
           
           // Обработчики событий
           item.addEventListener('mouseenter', () => {
               highlightDistrict(district.id);
               item.classList.add('bg-blue-50');
           });
           
           item.addEventListener('mouseleave', () => {
               item.classList.remove('bg-blue-50');
           });
           
           item.addEventListener('click', () => {
               highlightDistrict(district.id);
           });
           
           filteredDistrictsList.appendChild(item);
       });
   }
   
   // Подсветка отфильтрованных районов в основном списке
   function highlightFilteredDistricts(matchingDistricts) {
       const matchingIds = matchingDistricts.map(d => d.id);
       
       document.querySelectorAll('.district-list-item').forEach(item => {
           const districtId = item.dataset.districtId;
           
           if (matchingIds.includes(districtId)) {
               item.classList.remove('opacity-50');
               item.classList.add('border-green-200');
           } else {
               item.classList.add('opacity-50');
               item.classList.remove('border-green-200');
           }
       });
   }
   
   // Сброс фильтров
   function resetFilters() {
       filterSelects.forEach(select => {
           select.value = '0';
       });
       
       filterResultsContainer.classList.add('hidden');
       filterResultsCount.textContent = '18 районов';
       activeResultsCount.textContent = '0';
       
       // Снимаем подсветку с основного списка
       document.querySelectorAll('.district-list-item').forEach(item => {
           item.classList.remove('opacity-50', 'border-green-200');
       });
       
       // Показываем сообщение
       showToast('Фильтры сброшены', 'success');
   }
   
   // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
   
   function calculateAverageScore(ratings) {
       const values = Object.values(ratings);
       return values.reduce((a, b) => a + b, 0) / values.length;
   }
   
   function getScoreColor(score) {
       if (score >= 8) return 'bg-green-100 text-green-800';
       if (score >= 6) return 'bg-blue-100 text-blue-800';
       if (score >= 4) return 'bg-yellow-100 text-yellow-800';
       return 'bg-red-100 text-red-800';
   }
   
   function getRatingColorClass(rating, type = 'standard') {
       if (type === 'price' || type === 'traffic') {
           if (rating <= 3) return 'bg-green-100 text-green-800';
           if (rating <= 5) return 'bg-yellow-100 text-yellow-800';
           if (rating <= 7) return 'bg-orange-100 text-orange-800';
           return 'bg-red-100 text-red-800';
       } else {
           if (rating >= 8) return 'bg-green-100 text-green-800';
           if (rating >= 6) return 'bg-blue-100 text-blue-800';
           if (rating >= 4) return 'bg-yellow-100 text-yellow-800';
           return 'bg-red-100 text-red-800';
       }
   }
   
   function getWordForm(number, forms) {
       const n = Math.abs(number) % 100;
       const n1 = n % 10;
       if (n > 10 && n < 20) return forms[2];
       if (n1 > 1 && n1 < 5) return forms[1];
       if (n1 === 1) return forms[0];
       return forms[2];
   }
   
   function showToast(message, type = 'info') {
       const toast = document.createElement('div');
       toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up ${
           type === 'success' ? 'bg-green-500 text-white' : 
           type === 'error' ? 'bg-red-500 text-white' : 
           'bg-blue-500 text-white'
       }`;
       toast.innerHTML = `
           <div class="flex items-center">
               <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
               <span>${message}</span>
           </div>
       `;
       
       document.body.appendChild(toast);
       
       setTimeout(() => {
           toast.style.opacity = '0';
           toast.style.transition = 'opacity 0.3s';
           setTimeout(() => toast.remove(), 300);
       }, 3000);
   }
   
   // ==================== ОСНОВНЫЕ ФУНКЦИИ КАРТЫ ====================
   
   // Предзагрузка изображений
   function preloadDistrictImages() {
       console.log('Предзагрузка изображений районов...');
       
       districts.forEach(district => {
           const img = new Image();
           img.src = district.image;
           img.alt = `Карта района ${district.name}`;
           img.classList.add('absolute', 'inset-0', 'w-full', 'h-full', 'object-contain', 'opacity-0', 'transition-opacity', 'duration-300', 'district-map');
           img.dataset.districtId = district.id;
           
           preloadedImages[district.id] = img;
           mapsContainer.appendChild(img);
           
           img.onload = () => {
               console.log(`✓ ${district.name} загружено`);
           };
           
           img.onerror = () => {
               console.error(`✗ Ошибка загрузки: ${district.name}`);
               img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999">Нет карты</text></svg>';
           };
       });
   }
   
   // Создание списка районов
   function createDistrictsList() {
       districts.forEach((district, index) => {
           const listItem = document.createElement('button');
           listItem.className = 'district-list-item flex items-center w-full p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer text-left group';
           listItem.dataset.districtId = district.id;
           listItem.type = 'button';
           
           const numberSpan = document.createElement('span');
           numberSpan.className = 'text-xs font-bold text-blue-600 mr-3';
           numberSpan.textContent = (index + 1).toString().padStart(2, '0');
           
           const colorIndicator = document.createElement('div');
           colorIndicator.className = 'w-4 h-4 rounded-full mr-3 flex-shrink-0 bg-blue-100 border border-blue-300 group-hover:bg-blue-200 transition-colors';
           
           const textDiv = document.createElement('div');
           textDiv.className = 'flex-grow';
           textDiv.innerHTML = `
               <div class="font-bold text-gray-800 text-sm md:text-base group-hover:text-blue-700">${district.name}</div>
               <div class="text-xs md:text-sm text-gray-600 mt-1">
                   <i class="fas fa-users mr-1"></i>${district.population}
               </div>
           `;
           
           listItem.appendChild(numberSpan);
           listItem.appendChild(colorIndicator);
           listItem.appendChild(textDiv);
           districtsList.appendChild(listItem);
       });
   }
   
   // Создание карточек районов
   function createDistrictCards() {
       districts.forEach((district, index) => {
           const card = document.createElement('div');
           card.className = 'district-card bg-gray-800 rounded-xl p-4 md:p-5 border border-gray-700 hover:border-blue-500 transition-all duration-300 group';
           card.dataset.districtId = district.id;
           
           const ratings = districtRatings[district.id] || {};
           
           card.innerHTML = `
               <div class="flex items-start justify-between mb-3">
                   <div>
                       <div class="text-xs text-blue-400 font-medium mb-1">Район ${(index + 1).toString().padStart(2, '0')}</div>
                       <h3 class="text-lg font-bold text-white">${district.name}</h3>
                   </div>
                   <div class="w-5 h-5 rounded-full bg-blue-100"></div>
               </div>
               <div class="mb-3">
                   <p class="text-gray-400 text-sm">${district.description}</p>
               </div>
               <div class="space-y-2">
                   <div class="flex justify-between">
                       <span class="text-gray-400 text-sm">Цена:</span>
                       <span class="text-sm font-bold ${getRatingColorClass(ratings.price || 5, 'price').replace('100', '700').replace('800', '300')}">${ratings.price || 5}/10</span>
                   </div>
                   <div class="flex justify-between">
                       <span class="text-gray-400 text-sm">Экология:</span>
                       <span class="text-sm font-bold ${getRatingColorClass(ratings.ecology || 5).replace('100', '700').replace('800', '300')}">${ratings.ecology || 5}/10</span>
                   </div>
               </div>
           `;
           
           cardsContainer.appendChild(card);
       });
   }
   
   // Показать карту района
   function showDistrictMap(districtId) {
       if (activeDistrict === districtId) return;
       
       // Скрыть все изображения районов
       document.querySelectorAll('.district-map').forEach(img => {
           img.classList.remove('opacity-100');
           img.classList.add('opacity-0');
       });
       
       // Показать выбранный район
       const districtImage = preloadedImages[districtId];
       if (districtImage) {
           mainMap.classList.remove('opacity-100');
           mainMap.classList.add('opacity-0');
           
           setTimeout(() => {
               districtImage.classList.remove('opacity-0');
               districtImage.classList.add('opacity-100');
           }, 50);
           
           activeDistrict = districtId;
       }
   }
   
   // Вернуться к основной карте
   function showMainMap() {
       if (hoverTimeout) clearTimeout(hoverTimeout);
       if (switchTimeout) clearTimeout(switchTimeout);
       
       switchTimeout = setTimeout(() => {
           if (hoveredDistrict === null && activeDistrict !== null) {
               document.querySelectorAll('.district-map').forEach(img => {
                   img.classList.remove('opacity-100');
                   img.classList.add('opacity-0');
               });
               
               mainMap.classList.remove('opacity-0');
               mainMap.classList.add('opacity-100');
               
               activeDistrict = null;
               highlightDistrictInList(null);
               highlightDistrictCard(null);
           }
       }, 300);
   }
   
   // Подсветка в списке
   function highlightDistrictInList(districtId) {
       document.querySelectorAll('.district-list-item').forEach(item => {
           item.classList.remove('bg-blue-100', 'border-blue-500', 'shadow-md');
           item.querySelector('.w-4').classList.remove('bg-blue-600');
           item.querySelector('.w-4').classList.add('bg-blue-100', 'border-blue-300');
       });
       
       if (districtId) {
           const activeItem = document.querySelector(`.district-list-item[data-district-id="${districtId}"]`);
           if (activeItem) {
               activeItem.classList.add('bg-blue-100', 'border-blue-500', 'shadow-md');
               activeItem.querySelector('.w-4').classList.remove('bg-blue-100', 'border-blue-300');
               activeItem.querySelector('.w-4').classList.add('bg-blue-600');
           }
       }
   }
   
   // Подсветка карточки
   function highlightDistrictCard(districtId) {
       document.querySelectorAll('.district-card').forEach(card => {
           card.classList.remove('border-blue-500', 'ring-2', 'ring-blue-500/20');
       });
       
       if (districtId) {
           const activeCard = document.querySelector(`.district-card[data-district-id="${districtId}"]`);
           if (activeCard) {
               activeCard.classList.add('border-blue-500', 'ring-2', 'ring-blue-500/20');
           }
       }
   }
   
   // Подсветка района (общая функция)
   function highlightDistrict(districtId) {
       showDistrictMap(districtId);
       highlightDistrictInList(districtId);
       highlightDistrictCard(districtId);
       
       // Подсветка в отфильтрованном списке
       document.querySelectorAll('.filtered-district-item').forEach(item => {
           item.classList.remove('bg-blue-50', 'border-blue-400');
           if (item.dataset.districtId === districtId) {
               item.classList.add('bg-blue-50', 'border-blue-400');
           }
       });
   }
   
   // ==================== ИНИЦИАЛИЗАЦИЯ ====================
   
   function initialize() {
       console.log('Инициализация системы...');
       
       // Создаем основные элементы
       createDistrictsList();
       createDistrictCards();
       preloadDistrictImages();
       
       // Настройка фильтров
       filterSelects.forEach(select => {
           select.addEventListener('change', applyFilters);
       });
       
       // Кнопка сброса фильтров
       resetFiltersBtn.addEventListener('click', resetFilters);
       
       // Обработчики для элементов списка районов
       document.querySelectorAll('.district-list-item').forEach(item => {
           const districtId = item.dataset.districtId;
           
           // Для десктопа
           if (!isMobile) {
               item.addEventListener('mouseenter', () => {
                   if (hoverTimeout) clearTimeout(hoverTimeout);
                   hoveredDistrict = districtId;
                   highlightDistrict(districtId);
               });
               
               item.addEventListener('mouseleave', () => {
                   hoveredDistrict = null;
                   hoverTimeout = setTimeout(() => {
                       showMainMap();
                   }, 100);
               });
           }
           
           // Клик для всех устройств
           item.addEventListener('click', (e) => {
               e.stopPropagation();
               highlightDistrict(districtId);
           });
       });
       
       // Обработчики для карточек районов
       document.querySelectorAll('.district-card').forEach(card => {
           const districtId = card.dataset.districtId;
           
           if (!isMobile) {
               card.addEventListener('mouseenter', () => {
                   if (hoverTimeout) clearTimeout(hoverTimeout);
                   hoveredDistrict = districtId;
                   highlightDistrict(districtId);
               });
               
               card.addEventListener('mouseleave', () => {
                   hoveredDistrict = null;
                   hoverTimeout = setTimeout(() => {
                       showMainMap();
                   }, 100);
               });
           }
           
           card.addEventListener('click', (e) => {
               e.stopPropagation();
               highlightDistrict(districtId);
           });
       });
       
       // Обработчик для карты
       mainMap.parentElement.addEventListener('mouseleave', () => {
           if (!isMobile) {
               hoveredDistrict = null;
               showMainMap();
           }
       });
       
       // Активируем первый район
       setTimeout(() => {
           if (districts.length > 0) {
               highlightDistrict(districts[0].id);
           }
       }, 1000);
       
       // Применяем начальные фильтры
       applyFilters();
   }
   
   // Запуск инициализации
   initialize();
   
   // Обработчик изменения размера окна
   window.addEventListener('resize', () => {
       isMobile = window.innerWidth < 768;
   });
});
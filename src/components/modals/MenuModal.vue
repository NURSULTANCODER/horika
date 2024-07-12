<template>
  <v-dialog v-model="syncedOpened" width="1200" overlay-opacity="0.8">
    <div class="standart-modal-card">
      <div ref="root" class="menues">
        <h2>{{ menuItem.name }}</h2>
        <div class="menu">
          <div class="categories">
						<h3>Page</h3>
            <ul class="categories__list">
              <li v-for="(menuI, index,) in menu.children" 
                  :class="activeMenu === index ? 
                  'categories__item categories__item_active' 
                  : 'categories__item'" 
                  :key="menuI.id"
                  v-on:click="setActiveMenu(index)">
                <p>{{ menuI.name }}</p>
              </li>
            </ul>
            <h3>Categories</h3>
            <ul class="categories__list">
              <li :class="activeCategory === 'All disabled' ? 
                  'categories__item categories__item_active' 
                  : 'categories__item'" 
                  v-on:click="setActiveCategory('All disabled')">
                <p>All disabled</p><span>{{ allDisabled.length }}</span>
              </li>
              <li v-for="(category, index,) in menuItem.children" 
                  :class="activeCategory === index ? 
                  'categories__item categories__item_active' 
                  : 'categories__item'" 
                  :key="category.id"
                  v-on:click="setActiveCategory(index)">
                <p>{{ category.name }}</p><span>{{ category.children.length }}</span>
              </li>
            </ul>
          </div>
          <div class="dishes">
            <div v-if="activeDish && !activeDish[0] && activeCategory !== 'All disabled'" class="dish">
              <ul class="dish__list">
                <li class="dish__item" 
                    v-for="dish in menuItem.children[activeCategory].children"
                    :key="dish.id"
                    @click="setActiveDish(dish)">
                  <p>{{dish.name}}</p>
									<span v-if="dish.children">+Options</span>
                  <button 
                    :class="dish.isEnabled ? 'enabled' : 'disabled'"
                    v-on:click.stop="setIsEnabled(dish)">
                    {{dish.isEnabled ? 'Enabled' : 'Disabled'}}
                  </button>
                </li>
              </ul>
            </div>
            <div v-if="activeDish && !activeDish[0] && activeCategory === 'All disabled'" class="dish">
              <ul class="dish__list">
                <li class="dish__item" 
                    v-for="disabled in allDisabled"
                    :key="disabled.dish.id"
                    @click="setActiveDish(disabled.dish)">
                  <p>{{disabled.dish.name}}</p>
									<span>{{ disabled.status }}</span>
                  <button 
                    :class="disabled.dish.isEnabled ? 'enabled' : 'disabled'"
                    v-on:click.stop="setIsEnabled(disabled.dish)">
                    {{disabled.dish.isEnabled ? 'Enabled' : 'Disabled'}}
                  </button>
                </li>
              </ul>
            </div>
            <div v-if="activeDish[0]">
              <div class="disha-detail">
                <div class="disha-detail__header">
									<button class="disha-detail__header_back" @click="closeDish">
										<img :src="require(`@/assets/icons/back.svg`)" alt="">
										<span> back</span>
										</button>
                  <p>{{activeDish[0].name}}</p>
                  <button 
                    :class="activeDish[0].isEnabled ? 'enabled' : 'disabled'"
                    @click.stop="setIsEnabled(activeDish[0])">
                    {{activeDish[0].isEnabled ? 'Enabled' : 'Disabled'}}
                  </button>
                </div>
                <div v-if="activeDish[0].children">
                  <ul>
                    <li class="dish__item" 
												v-for="i in activeDish[0].children" 
												:key="i.id" 
												@click="setActiveDish(i)">
                      <p>{{i.name}}</p>
											<span v-if="i.children">+Options</span>
                      <button 
                        :class="i.isEnabled ? 'enabled' : 'disabled'"
                        v-on:click.stop="setIsEnabled(i)">
                        {{i.isEnabled ? 'Enabled' : 'Disabled'}}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="standart-modal-card-bottom battons-cancel-save">
				<div class="up-down">
					<button
            styleType="secondary"
            class="standart-button-content-width mr-2"
            type="button"
            @click="scrollByUp"
          ><img :src="require(`@/assets/icons/up.svg`)" alt=""></button>
					<button
            styleType="secondary"
            class="standart-button-content-width mr-2"
            type="button"
            @click="scrollByDown"
          ><img :src="require(`@/assets/icons/down.svg`)" alt=""></button>
				</div>
        <div><p>Last update: </p><span>{{ lastUpdateTime }}</span></div>
        <div class="d-flex align-center justify-end">
           <Button text="Update menu" 
									class="standart-button-content-width mr-2" 
									type="button" 
									:isLoading="isLoading"
									@handleClick="updateMenu" />
          <Button
            styleType="secondary"
            text="Cancel"
            class="standart-button-content-width mr-2"
            type="button"
            @handleClick="closeModal"
          />
          <Button text="Save" 
									class="standart-button-content-width" 
									type="button" 
									:isLoading="isLoading"
									@handleClick="save" />
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import Button from '@/components/commonComponents/Button';
import { mapGetters, mapActions, mapMutations } from 'vuex';
import * as dayjs from 'dayjs';

export default {
  name: 'MenuModal',
  data() {
    return {
			activeMenu: 0,
      activeCategory: 0,
      activeDish: [],
    }
  },
  components: {
    Button,
  },
  model: {
    prop: 'opened',
    event: 'opened:update',
  },
  props: {
    opened: {
      type: Boolean,
    },
		venueId: {
			type: String,
		}
  },
  computed: {
    ...mapGetters({
      getMenu: 'venues/getMenu',
      getGeneralSettings: 'app/getGeneralSettings',
      getLastUpdateTime: 'venues/getLastUpdateTime',
			isLoading: 'venues/isLoading',
    }),
    menu() {
      return this.getMenu;
    },
    lastUpdateTime() {
      if (localStorage.getItem('settings')) {
        this.setGeneralSettings(JSON.parse(localStorage.getItem('settings')));
      }
      const settings = { ...this.getGeneralSettings };
      const date = this.getLastUpdateTime
      
      
      if(settings.timeFormat === 2) {
        return dayjs(date).format('MMMM D, YYYY HH:mm')
      } else {
        return dayjs(date).format('MMMM D, YYYY h:mm A')
      }
    },
		menuItem() {
			return this.menu.children[this.activeMenu]
		},
    allDisabled() {
      
					function findDisabledDishId(children, arrId = []) {
						const disabled = []

						children.forEach(item => {
							if(item.isEnabled === false && !arrId.includes(item.id)) {
                switch (item.id[0]){
                  case 'i': 
                    disabled.push({'dish': item, status: 'Item'})
                    break
                  case 'm': 
                    disabled.push({'dish': item, status: 'Modifier'})
                    break
                  case 'g': 
                    disabled.push({'dish': item, status: 'Modifier group'})
                    break
                }
                arrId.push(item.id)
							} else {
								if(item.children) {
									disabled.push(...findDisabledDishId(item.children, arrId))
								} else {
									return []
								}
							}
						})

            return disabled
          }
						
      return findDisabledDishId(this.menu.children[this.activeMenu].children)
    },
    syncedOpened: {
      get() {
        return this.opened;
      },
      set(val) {
        return this.$emit('opened:update', val);
      },
    },
  },
  methods: {
		...mapMutations({
      setEnabladDish: 'venues/setEnabladDish',
      setGeneralSettings: 'app/setGeneralSettings',
    }),
    ...mapActions({
      changeMenu: 'venues/changeMenu',
      fetchMenu: 'venues/fetchMenu',
    }),

    closeModal() {
      this.syncedOpened = false;
      this.$emit('closeMenuModal');
    },
    async save() {

			const obj = {
					venueId: this.venueId,
					identifiers: {
						
					}
				}
			function findDisabledDish(arr) {
				arr.forEach(element => {
					function findDisabledDishId(children) {
						const disabled = []

						children.forEach(item => {
							if(item.isEnabled === false) {
								disabled.push(item.id)
							} else {
								if(item.children) {
									disabled.push(...findDisabledDishId(item.children))
								} else {
									return []
								}
							}
						})
						return disabled
					}
				
					obj.identifiers[element.name] = findDisabledDishId(element.children)
				});
				return obj
			}

			await this.changeMenu(findDisabledDish(this.menu.children))
      localStorage.setItem(this.venueId, JSON.stringify({menu: this.menu, lastUpdateTime: JSON.parse(localStorage.getItem(this.venueId)).lastUpdateTime}))
    },
    setActiveCategory(categoryIndex) {
      this.activeDish = []
      this.activeCategory = categoryIndex;
    },
		setActiveMenu(menuIndex) {
			this.activeMenu = menuIndex
      this.activeDish = []
      this.activeCategory = 0;
    },
    setIsEnabled(item) {
			this.setEnabladDish(item.id)
    },
    setActiveDish(dish) {
      this.activeDish = [dish, ...this.activeDish]
    },
		closeDish() {
			this.activeDish.shift()
		},
    scrollByUp() {
      this.$refs.root.scrollBy(0, -200)
    },
    scrollByDown() {
      this.$refs.root.scrollBy(0, 200)
    },
    async updateMenu() {
      const menu = await this.fetchMenu(this.venueId);
      const date = new Date()
      localStorage.setItem(this.venueId, JSON.stringify({menu: menu, lastUpdateTime: date}))
    }
  },
};
</script>
<style lang="scss" scoped>
.menues {
		display: flex;
		flex-direction: column;
  	justify-content: start;
		max-height: 800px;
    overflow-y: scroll;
	h2 {
		text-transform: uppercase;
		text-align: center;
		margin: 20px 0;
	}
}
.menu {
  width: 100%;;
  display: flex;
  justify-content: space-between;
  align-items: start;
  font-size: 18px;
}
.categories {
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
	align-items: center;
  & h3 {
    color: #5b7ffe;
		
  }
  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    list-style-type: none;
    margin: 10px;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    p {
      margin-bottom: 0;
			
    }
		span {
			margin-left: 20px;
		}
    &_active {
      background-color: rgb(183, 197, 247);
      
      color: #5b7ffe;
    }
  }
}

.dishes {
  width: 800px;
  margin: 0 auto;
}
.disha-detail {
  &__header {
    width: 100%;
    margin: 20px 0;
    font-size: 18px;
    list-style-type: none;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 100px;

		&_back {
			display: flex;
			align-items: center;
			margin: 20px;
			line-height: 24px;
			background-color: #5170e0;
			color: #fff;
			display: block;
			cursor: pointer;
			img path {
				fill: #fff;
			}
		}
    p {
      margin-bottom: 0;
    }
    button {
      border-radius: 5px;
      padding: 5px 10px;
    }
    .enabled {
      background-color: #5b7ffe;
      color: #fff;
    }
    .disabled {
      background-color: red;
      color: #fff;
    }
  }
}
.dish {
  ul {
    padding: 0;
  }

  &__item {
    width: 100%;
    margin: 20px 0;
    font-size: 18px;
    list-style-type: none;
    border: 0.5px solid #ccc;
    border-radius: 10px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    p {
      margin-bottom: 0;
    }
    button {
      border-radius: 5px;
      padding: 5px 10px;
    }
    .enabled {
      background-color: #5170e0;
			color: #fff;
    }
    .disabled {
      background-color: red;
			color: #fff;
    }
  }
}
.up-down {
	button {
		background-color: #5170e0;
		border-radius: 5px;
	}
}
.battons-cancel-save {
	z-index: 50;
	display: flex;
	justify-content: space-between;
}

</style>



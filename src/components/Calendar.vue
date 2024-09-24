<template>
  <h2 class="title">Set schedule</h2>
  <div class="calendar">
    <div class="calendar-header">
      <span class="calendar-header-all-day"
        >All <br />
        day</span
      >
      <div class="calendar-header-hours">
        <div class="calendar-header-hour" v-for="el in hours">
          {{ el }}
        </div>
      </div>
    </div>
    <div class="calendar-rows">
      <div class="calendar-row" v-for="(el, i) in days" :key="i">
        <div
          class="calendar-row-main-cell"
          :class="{ active: data[el].length }">
          {{ el }}
        </div>
        <div
          class="calendar-row-select-all"
          @click="() => onSelectAllClick(el)">
          <span
            class="calendar-row-select-all-icon"
            v-if="data[el].find(item => item.bt === 0 && item.et === 1439)"
            >✓</span
          >
        </div>
        <div
          class="calendar-row-cell"
          v-for="num in [...Array(24).keys()]"
          :class="{
            active: data[el].find(
              item => item.bt <= num * 60 && item.et >= num * 60,
            ),
          }"
          @click="() => onItemClick(el, num)"
          @mouseover="() => onMouseOver(el, num)"
          @mousedown="() => (isMousePressed = true)"
          @mouseup="() => (isMousePressed = false)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { WeeklySchedule } from '../interfaces';

const isMousePressed = ref<boolean>(false);

const days: string[] = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
const data = ref<WeeklySchedule>({
  mo: [
    {
      bt: 240,
      et: 779,
    },
  ],
  tu: [],
  we: [],
  th: [
    {
      bt: 240,
      et: 779,
    },
    {
      bt: 1140,
      et: 1319,
    },
  ],
  fr: [
    {
      bt: 660,
      et: 1019,
    },
  ],
  sa: [
    {
      bt: 0,
      et: 1439,
    },
  ],
  su: [],
});

const hours = [
  '00:00',
  '03:00',
  '06:00',
  '09:00',
  '12:00',
  '15:00',
  '18:00',
  '21:00',
];

const onItemClick = (
  day: string,
  time: number,
  onlySelect: boolean = false,
) => {
  const item = data.value[day];
  const fullTime = time * 60;
  const beforeStartInd = item.findIndex(el => el.bt - 60 === fullTime);
  const afterEndInd = item.findIndex(el => el.et === fullTime - 1);
  const startInd = item.findIndex(el => el.bt === fullTime);
  const endInd = item.findIndex(el => el.et === fullTime + 59);
  const isInItervalIndex = item.findIndex(
    el => fullTime >= el.bt && fullTime < el.et,
  );

  if (isInItervalIndex !== -1 && onlySelect) {
    return;
  }

  if (beforeStartInd >= 0) {
    item[beforeStartInd].bt -= 60;
    const anotherStart = item.find(el => el.et + 1 === item[beforeStartInd].bt);
    if (anotherStart) {
      const newItem = { bt: anotherStart?.bt, et: item[beforeStartInd].et };
      data.value[day] = item.filter(
        el => el.bt !== newItem.bt && el.et !== newItem.et,
      );
      data.value[day].push(newItem);
    }
  }
  if (afterEndInd >= 0 && beforeStartInd === -1) {
    item[afterEndInd].et += 60;
  }
  if (
    beforeStartInd === -1 &&
    afterEndInd === -1 &&
    startInd === -1 &&
    endInd === -1
  ) {
    if (isInItervalIndex !== -1) {
      const beginning = item[isInItervalIndex].bt;
      item[isInItervalIndex].bt = fullTime + 60;
      item.push({ bt: beginning, et: fullTime - 1 });
    } else {
      item.push({ bt: fullTime, et: fullTime + 59 });
    }
  }
  if (startInd !== -1) {
    if (item[startInd].bt + 60 > item[startInd].et) {
      data.value[day] = item.filter(el => el.bt !== item[startInd].bt);
    } else {
      item[startInd].bt += 60;
    }
  }
  if (endInd !== -1) {
    if (item[endInd].bt + 60 > item[endInd].et) {
      data.value[day] = item.filter(el => el.bt !== item[endInd].bt);
    } else {
      item[endInd].et -= 60;
    }
  }
  data.value[day].forEach(el => {
    if (el.bt < 0) {
      el.bt = 0;
    }
  });
};

const onSelectAllClick = (day: string) => {
  const isAllFilled = data.value[day].findIndex(
    item => item.bt === 0 && item.et === 1439,
  );

  if (isAllFilled !== -1) {
    data.value[day] = [];
  } else {
    data.value[day] = [];
    data.value[day].push({
      bt: 0,
      et: 1439,
    });
  }
};

const onMouseOver = (day: string, time: number) => {
  if (isMousePressed.value) {
    const item = data.value[day];
    const fullTime = time * 60;
    const isInItervalIndexStart = item.findIndex(el => fullTime >= el.bt + 60);
    const isInItervalIndexEnd = item.findIndex(el => fullTime >= el.bt - 60);
    if (isInItervalIndexStart) {
      onItemClick(day, time - 1, true);
    }
    if (isInItervalIndexEnd) {
      onItemClick(day, time + 1, true);
    }
    onItemClick(day, time, true);
  }
};
</script>

<style scoped lang="scss">
.title {
  text-transform: uppercase;
  color: #9f9f9f;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 400;
}
.calendar {
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  border-bottom: 1px solid #c6c6c6;
  width: fit-content;
  user-select: none;
  &-header {
    display: flex;
    margin-left: 52px;
    height: 60px;
    color: #9f9f9f;
    &-all-day {
      width: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
      font-size: 14px;
    }
    &-hours {
      display: flex;
    }
    &-hour {
      width: 78px;
      display: flex;
      align-items: center;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        height: 15px;
        bottom: 0;
        width: 1px;
        left: 0;
        background-color: #9f9f9f;
      }
    }
  }
  &-rows {
    display: flex;
    flex-direction: column;
  }
  &-row {
    display: flex;
    height: 60px;
    &-main-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      text-transform: uppercase;
      border-left: 1px solid #c6c6c6;
      border-top: 1px solid #c6c6c6;
      border-right: 1px solid #c6c6c6;
      font-size: 17px;
      color: #9f9f9f;
      &.active {
        background-color: #e5e5e5;
        color: #797979;
      }
    }
    &-select-all {
      width: 45px;
      border-top: 1px solid #c6c6c6;
      border-right: 1px solid #c6c6c6;
      background-color: #9f9f9f;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &-icon {
        background-color: #dddddd;
        height: 30px;
        width: 30px;
        border-radius: 50%;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #797979;
      }
    }
    &-cell {
      width: 25px;
      border-top: 1px solid #c6c6c6;
      border-right: 1px solid #c6c6c6;
      cursor: pointer;
      &.active {
        background-color: #e5e5e5;
      }
    }
  }
}
</style>

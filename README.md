# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# 简易吃豆人游戏

这是一个使用 React、Vite.js 和 PixiJS 开发的简单游戏。

## 游戏说明
- 玩家控制主角（蓝色圆形）在屏幕中移动
- 使用键盘方向键（↑↓←→）控制主角移动
- 每关都有不同数量的敌人（红色圆形）
- 敌人会自动随机移动并在碰到边界时反弹
- 主角碰到敌人时会吃掉敌人，每吃掉一个敌人得100分
- 当所有敌人被吃掉后，当前关卡结束
- 按空格键进入下一关
- 每过一关：
  - 敌人数量增加2个
  - 敌人移动速度提升20%
  - 难度逐渐提升

## 游戏流程
1. 每关开始时显示关卡信息和目标
2. 按空格键开始当前关卡
3. 使用方向键控制主角吃掉所有敌人
4. 关卡完成后显示得分和通关信息
5. 按空格键进入下一关
6. 如果失败可以按空格键重新开始

## 游戏界面
- 左上角显示当前关卡
- 显示当前得分
- 显示剩余敌人数量
- 关卡开始时显示目标信息
- 关卡结束时显示通关信息和得分

## 游戏特效
- 主角移动时会根据移动方向产生旋转效果
- 敌人会有呼吸效果动画
- 敌人被吃掉时会有缩小消失的动画效果
- 敌人移动时会在边界反弹

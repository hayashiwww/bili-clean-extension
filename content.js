/* ==========================================================
   B站右栏清理 —— content script
   开关存 chrome.storage，挂成 <html> 上的 bcx-* 类；
   样式由本文件注入 <style>，每秒兜底重建。
   ========================================================== */
(function () {
  'use strict';

  var DEFAULTS = { hideNav: true, homeOnly: true, favClean: true, hideRcmd: true, hideAds: true, hideRight: true, wide: false, theme: 'auto', logoGlowColor: '#FB7299', cursorGlowColor: '', cursorGlowStrength: 28 };
  var MAP = {
    hideNav: 'bcx-hide-nav',
    homeOnly: 'bcx-page-home',
    favClean: 'bcx-fav-clean',
    hideRcmd: 'bcx-hide-rcmd',
    hideAds: 'bcx-hide-ads',
    hideRight: 'bcx-hide-right',
    wide: 'bcx-wide'
  };

  var LOGO_SVG_B64 = 'PHN2ZyBmaWxsPSIjRkI3Mjk5IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiICAgdmlld0JveD0iMCAwIDUyIDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5iaWxpYmlsaTwvdGl0bGU+PHBhdGggZD0iTTQ2LjU3MyAyMC42MzJjLS4yMTUgMC0uMzk4LjAxNy0uNTc3LS4wMDQtLjM2NC0uMDQyLS43MjktLjAzNC0xLjA5My0uMDQ0LS4yMzYtLjAwNy0uMjI5LS4wMDctLjI0OC0uMjM1LS4wNTktLjY5Ni0uMTIzLTEuMzkyLS4xODUtMi4wODgtLjA1NC0uNjExLS4xMDUtMS4yMjMtLjE2NS0xLjgzNC0uMDU0LS41Ni0uMTItMS4xMTctLjE3OC0xLjY3Ni0uMDU3LS41MjYtLjEwOS0xLjA1Mi0uMTY3LTEuNTc2LS4wNzQtLjY2LS4xNS0xLjMyLS4yMy0xLjk4LS4wNy0uNTgzLS4xNC0xLjE2OC0uMjE4LTEuNzUtLjEyMi0uOTAzLS4yNDgtMS44MDUtLjM3Ni0yLjcwN2E3OS40OTggNzkuNDk4IDAgMDAtLjQ3NC0yLjg3M2MtLjAzLS4xNzEtLjAyNi0uMTc3LjEzNy0uMjA1LjY3OS0uMTE2IDEuMzYxLS4yMTUgMi4wNTItLjIuMDc0LjAwMi4xNS4wMDQuMjI0LjAxMy4xMjEuMDE1LjE4NC4wNzQuMTkxLjIxNi4wMjQuNDk0LjA1OS45ODcuMDk1IDEuNDguMDU4LjgwOC4xMjEgMS42MTYuMTgxIDIuNDIzLjAzOS41Mi4wNzIgMS4wMzguMTEgMS41NTcuMDYzLjgzMy4xMyAxLjY2Ni4xOTIgMi40OTkuMDM5LjUxLjA3MiAxLjAyLjExMSAxLjUzLjA2Ljc0OC4xMjUgMS40OTUuMTg2IDIuMjQyLjAzOC40NzYuMDcyLjk1Mi4xMTMgMS40MjguMDYuNzA1LjEyNCAxLjQxLjE4NSAyLjExNC4wNDYuNTUuMDg3IDEuMTAyLjEzNCAxLjY3ek0yMC4yOTEgMy40NjhjLjEgMCAuMjUtLjAxMS4zOTguMDAyLjE4OC4wMTguMjI0LjA2Ni4yMzYuMjU2LjA1NC44NjguMTA1IDEuNzM2LjE2MyAyLjYwNS4wNjMuOTM2LjEzMiAxLjg3MS4yMDEgMi44MDYuMDY0Ljg1OS4xMjggMS43MTcuMTk2IDIuNTc2LjA3NS45NDMuMTU4IDEuODg1LjIzMyAyLjgyOS4wNTguNzIyLjEwNiAxLjQ0NS4xNjUgMi4xNjguMDU2LjY3MS4xMjIgMS4zNC4xODMgMi4wMTEuMDUuNTc3LjEwMyAxLjE1NC4xNTMgMS43MzIuMDE2LjE4My4wMDMuMTk1LS4xOTQuMTktLjUxNS0uMDEzLTEuMDI3LS4wNzMtMS41NDItLjA1OS0uMTE4LjAwNC0uMTUyLS4wNS0uMTcyLS4xNjMtLjA0My0uMjQ0LS4wMzYtLjQ5Mi0uMDYyLS43MzktLjA3LS42NTItLjExMS0xLjMwNy0uMTctMS45NjEtLjA1NC0uNTk0LS4xMTktMS4xODctLjE4LTEuNzgtLjA1NC0uNTQzLS4xMDctMS4wODUtLjE2NS0xLjYyOC0uMDU4LS41MzMtLjExOS0xLjA2Ny0uMTc5LTEuNi0uMDU1LS40OTEtLjExLS45ODItLjE2OS0xLjQ3My0uMDg3LS43MTktLjE3My0xLjQzOC0uMjY4LTIuMTU2LS4wODctLjY1OS0uMTg1LTEuMzE1LS4yNzgtMS45NzNhNzcuODY2IDc3Ljg2NiAwIDAwLS40MjUtMi42NzQgMzAuMDA2IDMwLjAwNiAwIDAwLS4xMTQtLjYwMmMtLjAyLS4xMDEtLjAwMi0uMTYuMTEzLS4xNzUuMzAzLS4wNDEuNjA1LS4xMDQuOTEtLjEzNC4zMDQtLjAyOC42MDktLjA4NS45NjctLjA1OHptMjEuNTY1IDguNjY4Yy41OCAwIC41OTQuMDA0LjY4Ny41MjcuMTE1LjY0Ni4xOTUgMS4yOTcuMjcxIDEuOTQ4LjA4LjY5NC4xNjEgMS4zODcuMjM1IDIuMDgyLjA2LjU1OS4xMSAxLjEyLjE2NiAxLjY3OC4wNi41ODYuMTIyIDEuMTcuMTgzIDEuNzU1LjAzMy4zMy4wNjUuNjYxLjEwMi45OTEuMDExLjA5Ni0uMDE3LjE0Ni0uMTExLjE1Ny0uMTk5LjAyMy0uMzk1LjA1LS41OTMuMDctLjM2Mi4wNC0uNzI1LjA3OC0xLjA4Ny4xMTItLjE4OC4wMTctLjIuMDA3LS4yMzUtLjE3NS0uMzE4LTEuNjQ2LS42MzctMy4yOTEtLjk1Mi00LjkzOS0uMjEtMS4wOTUtLjQxNC0yLjE5LS42Mi0zLjI4Ni0uMDI4LS4xNS0uMDUzLS4zMDItLjA3Ny0uNDUzLS4wMTQtLjA4Ny4wMS0uMTQzLjEwOC0uMTY2LjY1My0uMTUzIDEuMzEzLS4yNzEgMS45MjMtLjMwMXptLTI0LjM3MyAwYy42MiAwIC42MTguMDAyLjcxNC41NjcuMTQ4Ljg3My4yNTMgMS43NTIuMzQ3IDIuNjMzLjA5MS44NTYuMTkyIDEuNzEuMjgyIDIuNTY1LjA2LjU4Ni4xMDggMS4xNzIuMTY1IDEuNzU2LjA0LjQxNi4wODkuODMxLjEzMyAxLjI0Ni4wMDUuMDUxLjAwOC4xMDIuMDExLjE1NC4wMS4yMDMgMCAuMjItLjE5NS4yNC0uMzg3LjA0LS43NzYuMDc0LTEuMTYzLjExMi0uMTQuMDE0LS4yOC4wMzUtLjQyLjA0OC0uMTg1LjAxNy0uMTkxLjAxNy0uMjI3LS4xNy0uMTMtLjY2LS4yNTctMS4zMi0uMzg0LTEuOTgtLjMwNi0xLjU4OC0uNjE1LTMuMTc1LS45Mi00Ljc2My0uMTItLjYzNi0uMjI1LTEuMjc0LS4zNDQtMS45MS0uMDIyLS4xMTYtLjAwNi0uMTcuMTE0LS4xOTguNjQ4LS4xNTIgMS4zLS4yNyAxLjg4Ny0uM3ptOC4xOSA2LjY2djIuNjY1YzAgLjAyNS0uMDAyLjA1MS4wMDIuMDc3LjAxMi4xMy0uMDM1LjE4Ni0uMTY4LjE4LS4xNzUtLjAwNy0uMzQ4LS4wMDItLjUyMy4wMDItLjM2NS4wMDctLjczLS4wMDgtMS4wOTUuMDM0LS4yMDEuMDI0LS4xOTcuMDExLS4yMTctLjIwMi0uMDYtLjY3LS4xMjUtMS4zNDEtLjE4Ni0yLjAxMi0uMDU2LS42Mi0uMTA3LTEuMjQtLjE2NC0xLjg2LS4wNTgtLjYzNy0uMTI0LTEuMjczLS4xODMtMS45MS0uMDQtLjQyNC0uMDc2LS44NDgtLjExMS0xLjI3My0uMDQ3LS41NTMtLjA5LTEuMTA1LS4xMzktMS42NTgtLjAyLS4yMzMtLjAwMy0uMjY2LjIyNy0uMjlhMTEuMzU2IDExLjM1NiAwIDAxMS43OS0uMDU2Yy4xNS4wMDkuMjk3LjAzOC40NDEuMDczLjE4Mi4wNDMuMjAyLjA3LjIxMi4yNi4wMi4zODQuMDQuNzY4LjA1IDEuMTUyLjAxMS40MjcuMDAyLjg1NC4wMTcgMS4yODEuMDQgMS4xNzguMDM0IDIuMzU3LjA0OCAzLjUzNnptMjQuMzI1LjEydjIuNTI0YzAgLjA0My0uMDAxLjA4NS4wMDEuMTI5LjAwOS4xMS0uMDQzLjE1LS4xNDcuMTQ5LS4yNTgtLjAwMi0uNTE1IDAtLjc3Mi4wMDMtLjI5MS4wMDMtLjU4MS4wMDItLjg3MS4wMzMtLjE5Mi4wMjItLjE5My4wMDgtLjIxLS4xODNsLS4yNDItMi42MjJjLS4wNzItLjgwNy0uMTQtMS42MTQtLjIxMy0yLjQyMS0uMDc3LS44MzMtLjE2LTEuNjYzLS4yMzQtMi40OTVhODQuNzggODQuNzggMCAwMS0uMS0xLjI1Yy0uMDExLS4xODIuMDA4LS4yMTQuMjEzLS4yMy4zNTUtLjAyOS43MDktLjA3NyAxLjA2Ny0uMDcuMzU2LjAwNi43MTQtLjAxNCAxLjA2OC4wNTQuMy4wNTguMzE2LjA3NS4zMzMuMzk3LjA1Mi45NDcuMDM2IDEuODk2LjA3IDIuODQzLjAzNCAxLjAwOC4wMSAyLjAxNi4wMzcgMy4xNHptLTguNzQ3LTExLjM2Yy4yMS4wMTIuMzc1LjAwMi41NC4wMzguMTA0LjAyNC4xNTcuMDcyLjE2Ny4xODQuMDUuNTQzLjEwMyAxLjA4Ni4xNTcgMS42My4wNDMuNDQuMDkuODguMTM0IDEuMzIxbC4wMDQuMDI2Yy4wMzYuMjc3LjAyOC4yODUtLjI0Mi4zLS4yNC4wMTMtLjQ4LjAzNC0uNzIuMDQ5LS4xNTcuMDEtLjIwNy4wMzYtLjIzMy0uMTk0LS4wOS0uODEzLS4xOTQtMS42MjMtLjI5NC0yLjQzNWEyNS4zMzggMjUuMzM4IDAgMDAtLjA5Mi0uNjgzYy0uMDItLjEzLjAzLS4yLjE1LS4yMS4xNTgtLjAxNS4zMTYtLjAxOS40MjktLjAyNnptLTI0LjI5NS4wMDNjLjE2Mi4wMS4zMjktLjAwMy40OTIuMDM0LjA5My4wMjIuMTQuMDYxLjE1LjE2OC4wMi4yNTQuMDU4LjUwOC4wODIuNzYyLjA3Ni43OC4xNDggMS41NjEuMjIgMi4zNDIuMDE1LjE3LjAxMS4xNzQtLjE0Ny4xODUtLjI4MS4wMjEtLjU2My4wNDItLjg0NS4wNTMtLjE2NC4wMDgtLjE4NC0uMDEyLS4yMDUtLjE4LS4wNzEtLjU3NS0uMTM4LTEuMTUtLjIwNy0xLjcyNi0uMDU1LS40NzQtLjEwMi0uOTQ4LS4xNy0xLjQyMS0uMDE4LS4xMy4wMjUtLjE2Ny4xMjktLjE4OC4xNjUtLjAzNC4zMzEtLjAyMy41MDEtLjAyOXptOC41NTYgMi4xNXYxLjQ4MmMwIC4yMjItLjAwMy4yMjQtLjIyNC4yMjFhNi45MjggNi45MjggMCAwMS0uNzkyLS4wNDFjLS4xNy0uMDIyLS4xNzQtLjAxNi0uMTc5LS4xOTctLjAxNy0uNjA0LS4wMzUtMS4yMDktLjA0Ny0xLjgxMy0uMDA5LS40MDktLjAxNC0uODE3LS4wMzgtMS4yMjYtLjAxMy0uMjEtLjAwMi0uMjEzLjItLjIxNi4yOTktLjAwMy41OTcuMDEuODkzLjA1Ni4xNzguMDI4LjE4Ni4wMjguMTg3LjIyNmwuMDAxIDEuNTA4aC0uMDAxem0yNC4zMzcuMDEydjEuNDg0YzAgLjIwOC0uMDA0LjIxLS4yMTIuMjA4YTEwLjgyNiAxMC44MjYgMCAwMS0uODE3LS4wMzljLS4xMzYtLjAxLS4xNzUtLjA2Ny0uMTY2LS4xOXYtLjA1MmMtLjAyLS45NTQtLjA0Mi0xLjkwOC0uMDYtMi44NjItLjAwMS0uMDUtLjAwNC0uMTAyLS4wMDItLjE1My4wMDMtLjE5My4wMDMtLjE5OC4xOTYtLjE5Ni4yNjUuMDAxLjUyOS4wMTUuNzkzLjA0MS4zMjMuMDMyLjI2Ni4wNzIuMjY4LjMyOHYxLjQzMXptLTMzLjU1OSAxLjE2Yy4wMDcuMjcyLjAwNy4yNzItLjI1My4zMzUtLjE3Ni4wNDMtLjM1Mi4wOS0uNTMuMTMtLjE1MS4wMzQtLjE3OC4wMTUtLjIwNC0uMTM0bC0uNTQxLTMuMDM4Yy0uMDM2LS4yMS0uMDI3LS4yMjIuMTc5LS4yNTkuMjUzLS4wNDQuNTA1LS4wODguNzU4LS4xMjguMTYxLS4wMjUuMTgyLS4wMTYuMjE0LjE2Mi4wNjQuMzYuMTI0LjcyLjE3MiAxLjA4My4wNzMuNTczLjEzMyAxLjE0OS4yIDEuNzIzLjAwNS4wNDIuMDAzLjA4NS4wMDUuMTI3ek0zOS4xIDcuOTQ1Yy4zMzEtLjA1NC42NjUtLjExIDEtLjE2Mi4xMi0uMDE5LjE1Ni4wNTcuMTcxLjE2NC4wNTcuMzk2LjEyOS43OS4xNzUgMS4xODYuMDY5LjU3NS4xNjMgMS4xNDcuMTggMS43MjZsLjAwMy4xOGMuMDAzLjA5MS0uMDQzLjEzOS0uMTI4LjE1OS0uMjI2LjA1LS40NTMuMTAyLS42NzguMTU2LS4xMDguMDI2LS4xNDUtLjAyLS4xNjMtLjEyNi0uMDY3LS40MDMtLjE0Ni0uODA0LS4yMTUtMS4yMDUtLjExNy0uNjYyLS4yMzEtMS4zMjQtLjM0NS0xLjk4Ni0uMDAzLS4wMjQgMC0uMDUgMC0uMDkyem0tMTUuMjMyIDIuMzIyYy0uMDEuMzUyLjAxMS42NTktLjAzNy45NjUtLjAxNC4wOTctLjA0Mi4xNi0uMTQ2LjE2OS0uMjI0LjAxOC0uNDQ3LjAzNi0uNjcuMDU5LS4xMDcuMDExLS4xMzctLjAzNS0uMTU1LS4xNDEtLjA1LS4zMTMtLjA0LS42My0uMDcxLS45NDQtLjA1Ny0uNTk0LS4wODEtMS4xOTEtLjEyLTEuNzg2LS4wMDktLjE0NS0uMDIzLS4yOS0uMDM1LS40MzQtLjAwNi0uMDgxLjAyNi0uMTI3LjExMi0uMTMuMjktLjAxMi41NzgtLjA2NS44NjktLjA1NC4xNy4wMDYuMTg0LjAxNy4xOTYuMTg5LjAwOC4xMTkuMDA2LjIzOS4wMDkuMzU5bC4wNDggMS43NDh6bTI0LjMyNi0uMzQxYzAgLjQxLjAwNS44MiAwIDEuMjMtLjAwNC4yMTItLjAyOC4yMy0uMjI5LjI1LS4xOTkuMDE4LS4zOTYuMDMzLS41OTQuMDU0LS4xMTIuMDEyLS4xNjQtLjAyLS4xNzEtLjE1LS4wMjktLjU0NC0uMDY4LTEuMDg4LS4xMDYtMS42MzItLjAzLS40NTEtLjA2My0uOTAyLS4wOTQtMS4zNTItLjAwNC0uMDUyLS4wMDEtLjEwMy0uMDA0LS4xNTQtLjAwNS0uMDkuMDIyLS4xNDMuMTIzLS4xNDYuMjgxLS4wMS41Ni0uMDY0Ljg0My0uMDU0LjE3My4wMDYuMTc2LjAwOS4xODkuMTg5LjA0Mi41ODcuMDQ2IDEuMTc2LjA0MyAxLjc2NXpNMTUuNDYgMTcuMjQ5Yy4zNTUuMzkyLjM3My44NTYuMjU2IDEuMzQxLS4xMTguNDg2LS4zODcuODg2LS43MTMgMS4yNDUtLjU0Ni42LTEuMjA3IDEuMDQyLTEuOTA5IDEuNDE4YTEzLjMxOSAxMy4zMTkgMCAwMS0zLjgyNyAxLjMzMyAyMi4xNiAyMi4xNiAwIDAxLTIuOTEuMzc2Yy0uMjk4LjAxNi0uNTk1LjAzLS44OTMuMDI4LS4yMTYgMC0uNDMzLjAwNi0uNjQ4LS4wMDItLjE4NC0uMDA2LS4yMS0uMDM4LS4yMjUtLjIzLS4wNTYtLjY4OC0uMTAzLTEuMzc3LS4xNjQtMi4wNjUtLjA3Mi0uNzk4LS4xNTUtMS41OTUtLjIzMi0yLjM5Mi0uMDU2LS41NzctLjEwNS0xLjE1NS0uMTY3LTEuNzMtLjA3MS0uNjc4LS4xNTEtMS4zNTUtLjIzLTIuMDMzLS4wNy0uNjI2LS4xNC0xLjI1Mi0uMjE1LTEuODc5LS4wODQtLjY5NC0uMTcxLTEuMzg2LS4yNjQtMi4wNzgtLjA5LS42NjctLjE4NS0xLjMzMy0uMjgzLTEuOTk5LS4xNi0xLjA5NS0uMzMzLTIuMTg5LS41MjEtMy4yOGE2OS44NjIgNjkuODYyIDAgMDAtLjUwNy0yLjY2Yy0uMDI1LS4xMTguMDEtLjE2NS4xMTQtLjIwOC45OTItLjQxMyAxLjk4MS0uODMzIDIuOTczLTEuMjQ4LjE4NC0uMDc3LjM3My0uMTQxLjU3LS4xNzguMTM1LS4wMjUuMTcuMDAzLjE2Ni4xNC0uMDEuMzUuMDA0LjcwMS0uMDMgMS4wNWEzLjQ3OCAzLjQ3OCAwIDAwLS4wMTQuMjgxYy0uMDE2IDEuMjU1LS4wMyAyLjUxLjAwMiAzLjc2Ni4wMyAxLjEuMDg3IDIuMTk5LjE1IDMuMjk4LjA1Ljg2OC4xMjIgMS43MzYuMTk3IDIuNjAyLjA3Mi44NDkuMTYgMS42OTcuMjQ0IDIuNTQ2LjAxNS4xNjEuMDMuMTc2LjIxMy4xNTIuMzYtLjA1NS43MjUtLjA4NSAxLjA5LS4wOSAxLjEzMy0uMDAzIDIuMjQ4LjE1MyAzLjM1LjQxNS45NjYuMjMgMS45MDQuNTM2IDIuODA0Ljk2My40NDYuMjEyLjg3Mi40NTcgMS4yNi43NjcuMTMzLjEwNS4yNTEuMjI1LjM2My4zNTF6bTI0LjE1NC0uMjA2Yy40MzkuMzg2LjU5OC44NTguNDc0IDEuNDQyLS4xMDQuNDgyLS4zMzguODg3LS42NTEgMS4yNS0uNTAyLjU4Mi0xLjExMiAxLjAyNC0xLjc3MSAxLjM5NC0xLjI5NC43MjYtMi42NzEgMS4xOTgtNC4xMiAxLjQ3LS43OS4xNS0xLjU4Ny4yNjItMi4zODkuMzM0LS40NTQuMDQtLjkxLjA4OC0xLjQxOS4wNTdoLS41OTVjLS4xMTYgMC0uMTgyLS4wMzctLjE5Mi0uMTc1LS4wNDMtLjYwMy0uMDk0LTEuMjA2LS4xNDgtMS44MS0uMDU4LS42MzYtLjEyMi0xLjI3My0uMTgyLTEuOTEtLjA1NS0uNTg0LS4xMDYtMS4xNy0uMTY1LTEuNzU2LS4wNTUtLjU1MS0uMTE4LTEuMTAxLS4xNzgtMS42NTItLjA1NS0uNTE3LS4xMDktMS4wMzQtLjE3LTEuNTUtLjA3My0uNjI2LS4xNS0xLjI1Mi0uMjI4LTEuODc3LS4wNzMtLjU4NC0uMTQ1LTEuMTY3LS4yMjItMS43NS0uMDgzLS42MjUtLjE3LTEuMjUtLjI2MS0xLjg3My0uMTIyLS44MS0uMjUzLTEuNjE2LS4zODItMi40MjNhNzAuMTQ3IDcwLjE0NyAwIDAwLS42MjQtMy40MTdjLS4wMS0uMDUtLjAxNC0uMTAyLS4wMy0uMTUtLjAzNS0uMTEgMC0uMTcuMTA3LS4yMTIgMS4wNTQtLjQxMyAyLjA3NC0uOTEyIDMuMTM4LTEuMzA1LjEzOS0uMDUyLjI4LS4xMS40My0uMTI2LjEzNS0uMDEzLjE2OS4wMDkuMTU2LjE1My0uMDcxLjc4My0uMDMgMS41Ny0uMDY3IDIuMzU0LS4wMy42NC0uMDI3IDEuMjguMDA1IDEuOTIuMDA4LjE2My4wMTQuMzI2LjAxMy40ODgtLjAwOS43NjguMDMyIDEuNTM2LjA3IDIuMzA0LjA1MSAxLjAxNC4xMjQgMi4wMjYuMiAzLjAzOC4wNTMuNzMxLjEyNCAxLjQ2LjE5MiAyLjE5LjAzNy40LjA3Ni44LjEyNSAxLjE5Ny4wMjcuMjE5LjAzOC4yMi4yNTMuMTkyYTcuNjI3IDcuNjI3IDAgMDExLjE0LS4wODggMTUuMDIgMTUuMDIgMCAwMTMuOTUuNTk5Yy44NzQuMjQ5IDEuNzI1LjU2IDIuNTI5Ljk5NS4zNjIuMTkzLjcwMi40MjcgMS4wMTIuNjk3ek04LjYwOSAyMC44M2MuNDk2LS4yMzcgMi45MDctMi4xMjYgMy4wOTgtMi40MzQtMS4xNy0uNTA2LTIuMzQ0LS45NzUtMy42MDYtMS4zNmwuNTA4IDMuNzk0em0yNy4zNzctMi4zMWMuMDYxLS4wNjcuMDU1LS4xMTktLjAzLS4xNTYtLjE2Ni0uMDc2LS4zMzEtLjE1Ny0uNS0uMjI3LS45LS4zNjktMS44MDUtLjcyNi0yLjczMi0xLjAxOC0uMDgxLS4wMjUtLjE2NC0uMDgxLS4yNjgtLjAzM2wuNSAzLjcyOGMuMDc0LjAxNi4xMDMtLjAxOC4xMzYtLjA0MS44NDMtLjYyIDEuNjktMS4yMzMgMi41LTEuOS4xMzYtLjExMS4yNzItLjIyNC4zOTQtLjM1M3oiPjwvcGF0aD48L3N2Zz4=';

  var CSS = [
    /* 0. 极简顶栏 */
    /* 0. 极简顶栏 */    'html.bcx-hide-nav .left-entry-main > *:not([class*="home-page"]){display:none !important}',
    'html.bcx-hide-nav .right-entry__main > *:not([class*="avatar"]):not(:has([class*="avatar"])){display:none !important}',
    'html.bcx-hide-nav .upload-entry,html.bcx-hide-nav .header-upload-entry,html.bcx-hide-nav .right-upload-entry{display:none !important}',
    'html.bcx-hide-nav .bili-header__channel{display:none !important}',

    /* 0b. 首页只留搜索框：横幅、频道条、其余兄弟节点（由 JS 打标记） */
    'html.bcx-page-home .bili-header__banner,html.bcx-page-home .header-banner__inner,' +
    'html.bcx-page-home .bili-header__channel,html.bcx-page-home .header-channel{display:none !important}',
    'html.bcx-page-home .bili-header--large,html.bcx-page-home .bili-header{height:auto !important;min-height:64px !important}',
    'html.bcx-page-home body{overflow-x:hidden !important}',
    /* 首页首帧就把 B 站内容挡掉，避免刷新/返回时先闪一下原页面 */
    'html.bcx-page-home main.bili-feed4-layout,html.bcx-page-home .bili-feed4-layout,' +
    'html.bcx-page-home .header-channel,html.bcx-page-home .browser-tip,' +
    'html.bcx-page-home .palette-button-outer,html.bcx-page-home #i_cecream{display:none !important}',
    /* 首页配色：默认浅色，深色由 html.bcx-theme-dark 覆盖（可手动切换） */
    'html.bcx-page-home,html.bcx-page-home body{background:#fff !important}',
    'html.bcx-page-home .bili-header,html.bcx-page-home .bili-header__bar,' +
    'html.bcx-page-home .bili-header__menu{background:transparent !important;box-shadow:none !important;border-bottom:0 !important}',
    'html.bcx-page-home #app,html.bcx-page-home .app{background:transparent !important}',
    'html.bcx-page-home .bili-header__bar{background:transparent !important;box-shadow:none !important;border-bottom:0 !important;' +
    'position:fixed !important;top:0;left:0;right:0;' +
    'height:64px !important;z-index:10;justify-content:flex-end !important;display:flex !important;align-items:center !important;' +
    'padding-right:120px !important}',
    'html.bcx-page-home .bili-header__bar .left-entry,html.bcx-page-home .bili-header__bar .search-center,' +
    'html.bcx-page-home .bili-header__bar .center-search-container{display:none !important}',
    '#bcx-hero{position:fixed;inset:0;z-index:9;background:transparent;display:flex;flex-direction:column;' +
    'align-items:center;justify-content:center;gap:30px;padding-bottom:110px;font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif}',
    '#bcx-hero .bcx-logo{height:auto;min-height:74px;display:flex;align-items:center;justify-content:center;color:#FB7299;' +
    'font-size:56px;font-weight:700;letter-spacing:-1px}',
    /* 字标光晕：SVG 图 + 多层 drop-shadow（贴着字形发光）+ 呼吸动画 */
    '#bcx-hero .bcx-logo img{width:280px;height:auto;display:block;' +
    'animation:bcxBreath 3.4s ease-in-out infinite alternate}',
    '@keyframes bcxBreath{' +
    '0%{filter:drop-shadow(0 0 4px rgba(var(--bcx-logo-glow-rgb,251,114,153),.80)) ' +
    'drop-shadow(0 0 14px rgba(var(--bcx-logo-glow-rgb,251,114,153),.55)) ' +
    'drop-shadow(0 0 34px rgba(var(--bcx-logo-glow-rgb,251,114,153),.35))}' +
    '100%{filter:drop-shadow(0 0 2px rgba(var(--bcx-logo-glow-rgb,251,114,153),.45)) ' +
    'drop-shadow(0 0 8px rgba(var(--bcx-logo-glow-rgb,251,114,153),.28)) ' +
    'drop-shadow(0 0 18px rgba(var(--bcx-logo-glow-rgb,251,114,153),.16))}}',
    /* 鼠标跟随光晕（照 E:\下载\deepseek_html_20261116_71bdeb.html 的做法） */
    '#bcx-glow{position:fixed;top:0;left:0;width:420px;height:420px;border-radius:50%;pointer-events:none;z-index:20;' +
    'background:radial-gradient(circle,rgba(var(--bcx-cursor-glow-rgb,251,114,153),var(--bcx-cursor-alpha,.28)) 0%,' +
    'rgba(var(--bcx-cursor-glow-rgb,251,114,153),0) 70%);' +
    'mix-blend-mode:multiply;filter:blur(30px);transform:translate(-50%,-50%);will-change:transform}',
    '#bcx-hero .bcx-search{display:flex;align-items:center;gap:10px;width:min(584px,86vw);height:48px;padding:0 16px;' +
    'border:1px solid #dfe1e5;border-radius:24px;background:#fff;transition:box-shadow .15s,border-color .15s}',
    '#bcx-hero .bcx-search:hover,#bcx-hero .bcx-search:focus-within{box-shadow:0 1px 6px rgba(32,33,36,.28);border-color:rgba(223,225,229,0)}',
    '#bcx-hero .bcx-search input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;' +
    'font-size:16px;color:#18191c}',
    '#bcx-hero .bcx-search button{border:0;background:transparent;cursor:pointer;padding:0;display:flex;color:#9aa0a6}',
    /* 搜索框下的快捷入口 */
    '#bcx-hero .bcx-links{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}',
    '#bcx-hero .bcx-chip{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 16px;border-radius:18px;' +
    'border:1px solid #dfe1e5;color:#18191c;text-decoration:none;font-size:14px;background:transparent;transition:background .15s}',
    '#bcx-hero .bcx-searchwrap{position:relative;width:min(584px,86vw)}',
    '#bcx-hero .bcx-searchwrap .bcx-search{width:100%}',
    '#bcx-hist{position:absolute;top:calc(100% + 8px);left:0;right:0;background:#fff;border:1px solid #dfe1e5;' +
    'border-radius:16px;padding:6px;z-index:12;box-shadow:0 6px 20px rgba(60,64,67,.15);text-align:left}',
    '#bcx-hist[hidden]{display:none !important}',
    '#bcx-hist .hist-head{display:flex;align-items:center;justify-content:space-between;padding:6px 10px 4px;' +
    'font-size:12px;color:#70757a}',
    '#bcx-hist .hist-clear{border:0;background:none;color:#1a73e8;font-size:12px;cursor:pointer;padding:0}',
    /* 一格一格的词块（照 B 站搜索面板的排法） */
    '#bcx-hist .hist-items{display:flex;flex-wrap:wrap;gap:8px;padding:2px 8px 8px}',
    '#bcx-hist .hist-item{max-width:100%;padding:7px 12px;border-radius:10px;background:#f1f3f4;border:0;' +
    'color:#18191c;font-size:13px;font-family:inherit;cursor:pointer;text-align:left;' +
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#bcx-hist .hist-item:hover{background:#e8eaed}',
    '#bcx-hist .hist-empty{padding:8px 10px;color:#9aa0a6;font-size:13px}',
    /* 收藏夹页：只留左侧目录 + 收藏内容 */
    /* 收藏夹页：进页面就把个人主页那层先挡住，避免"先闪一下主页" */
    'html.bcx-fav-clean .space-theme-bg,html.bcx-fav-clean .space-avatar,html.bcx-fav-clean .nav-tab,' +
    'html.bcx-fav-clean .space-notice,html.bcx-fav-clean .favlist-info,' +
    'html.bcx-fav-clean [class*="space-header"],html.bcx-fav-clean [class*="h-cover"],' +
    'html.bcx-fav-clean [class*="h-inner"],html.bcx-fav-clean [class*="h-name"]{display:none !important}',
    'html.bcx-fav-clean .space-main{padding-top:14px !important}',
    /* 左下角的主题切换按钮 */
    '#bcx-theme-toggle{position:fixed;left:22px;bottom:22px;z-index:11;display:inline-flex;align-items:center;gap:7px;' +
    'height:34px;padding:0 14px;border-radius:17px;border:1px solid #dfe1e5;background:transparent;color:#18191c;' +
    'font-size:13px;font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;cursor:pointer;transition:background .15s}',
    '#bcx-theme-toggle:hover{background:#f1f3f4}',
    /* 深浅色切换时的过渡 */
    'html.bcx-page-home,html.bcx-page-home body,#bcx-hero .bcx-search,html.bcx-page-home .bili-header__bar,' +
    '#bcx-theme-toggle,#bcx-hero .bcx-chip{transition:background-color .45s ease,color .45s ease,border-color .45s ease}',
    /* 全站搜索框瘦身：只删「热搜/推荐词」，搜索历史保留 */
    '.nav-search-panel .trending,.search-panel .trending,' +
    '[class*="hotsearch"],[class*="hot-search"],[class*="hotword"],[class*="hot-word"],' +
    '.bcx-hot-hidden{display:none !important}',
    /* 搜索框里轮播的灰字提示（placeholder）隐藏 */
    'input.nav-search-input::placeholder,.nav-search-input::placeholder,' +
    'input[class*="search"]::placeholder{color:transparent !important}',
    '.bcx-fav-hidden{display:none !important}',
    /* 深色模式：照 Google 深色首页的配色 */
    /* 深色模式（跟随系统或手动切换）：照 Google 深色首页的配色 */
    'html.bcx-theme-dark.bcx-page-home,html.bcx-theme-dark.bcx-page-home body{background:#202124 !important}' +
    'html.bcx-theme-dark.bcx-page-home .bili-header__bar{background:transparent !important}' +
    'html.bcx-theme-dark #bcx-hero .bcx-search{background:#303134 !important;border-color:#5f6368 !important}' +
    'html.bcx-theme-dark #bcx-hero .bcx-search input{color:#e8eaed !important}' +
    'html.bcx-theme-dark #bcx-hero .bcx-logo{color:#e8eaed !important}' +
    'html.bcx-theme-dark #bcx-hero .bcx-chip{border-color:#5f6368 !important;color:#e8eaed !important}' +
    'html.bcx-theme-dark #bcx-hero .bcx-chip:hover{background:#303134 !important}' +
    'html.bcx-theme-dark #bcx-glow{mix-blend-mode:screen;' +
    'background:radial-gradient(circle,rgba(var(--bcx-cursor-glow-rgb,251,114,153),var(--bcx-cursor-alpha,.28)) 0%,' +
    'rgba(var(--bcx-cursor-glow-rgb,251,114,153),0) 70%)}' +
    'html.bcx-theme-dark #bcx-theme-toggle{border-color:#5f6368 !important;color:#e8eaed !important}' +
    'html.bcx-theme-dark #bcx-theme-toggle:hover{background:#303134 !important}' +
    'html.bcx-theme-dark #bcx-hist{background:#303134 !important;border-color:#5f6368 !important}' +
    'html.bcx-theme-dark #bcx-hist .hist-head{color:#9aa0a6 !important}' +
    'html.bcx-theme-dark #bcx-hist .hist-item{color:#e8eaed !important;background:#303134 !important}' +
    'html.bcx-theme-dark #bcx-hist .hist-item:hover{background:#3c4043 !important}',
    '.bcx-home-hidden{display:none !important}',

    /* 1. 推荐 / 接下来播放（注意：视频选集 .video-pod 也住在 .rcmd-tab 里，要留着） */
    'html.bcx-hide-rcmd .rcmd-tab > *:not(.video-pod):not([class*="video-pod"]){display:none !important}',
    'html.bcx-hide-rcmd .recommend-list-v1,',
    'html.bcx-hide-rcmd .next-play,',
    'html.bcx-hide-rcmd .recommend-list,',
    'html.bcx-hide-rcmd #reco_list,',
    'html.bcx-hide-rcmd .bpx-player-ending-related{display:none !important}',

    /* 2. 页面广告 */
    'html.bcx-hide-ads .ad-report,html.bcx-hide-ads .ad-report-inner,html.bcx-hide-ads .ad-floor-exp,' +
    'html.bcx-hide-ads #slide_ad,html.bcx-hide-ads .slide-ad-exp,html.bcx-hide-ads [data-ad],' +
    'html.bcx-hide-ads .video-card-ad-small,html.bcx-hide-ads .video-page-game-card,' +
    'html.bcx-hide-ads .video-page-game-card-small,html.bcx-hide-ads .floor-single-card,' +
    'html.bcx-hide-ads .eva-banner,html.bcx-hide-ads .bili-video-card__info--ad,' +
    'html.bcx-hide-ads .bili-video-card:has(.bili-video-card__info--ad){display:none !important}',

    /* 3. 右侧栏：只保留「UP主卡（名字 + 关注）」 */
    'html.bcx-hide-right .right-container{display:block !important;position:absolute !important;' +
    'right:6px !important;top:0;width:350px !important;margin:0 !important;z-index:6 !important;overflow:hidden !important}',
    'html.bcx-hide-right .right-container-inner{display:block !important;padding-bottom:0 !important}',
    /* 不再用白名单（会误伤不同版本的选集模块）：只点名删掉弹幕列表和推荐区 */
    'html.bcx-hide-right #danmukuBox,html.bcx-hide-right .danmaku-box{display:none !important}',
    'html.bcx-wide .right-container{display:none !important}',
    '.bcx-up-hidden{display:none !important}',
    'html.bcx-hide-right .bcx-detected-right{display:none !important}'
  ].join('\n');

  var root = document.documentElement;

  function note(msg) {
    try {
      if (root) root.setAttribute('data-bcx-err', String(msg).slice(0, 300));
    } catch (e) { /* 忽略 */ }
  }

  if (!root) { return; }

  var state = Object.assign({}, DEFAULTS);
  var appliedWidth = 0;

  /* ---------- 样式注入 ---------- */
  function ensureStyle() {
    if (document.getElementById('bcx-style')) return;
    var style = document.createElement('style');
    style.id = 'bcx-style';
    style.textContent = CSS;
    (document.head || root).appendChild(style);
  }

  function paint() {
    var isHome = isHomePage();
    for (var key in MAP) {
      if (!Object.prototype.hasOwnProperty.call(MAP, key)) continue;
      var on = !!state[key];
      if (key === 'homeOnly') on = on && isHomePage();
      if (key === 'favClean') on = on && isFavPage();
      root.classList.toggle(MAP[key], on);
    }

    /* 深浅色：auto / dark / light，左下角按钮可切 */
    var dark;
    if (state.theme === 'dark') dark = true;
    else if (state.theme === 'light') dark = false;
    else {
      try { dark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { dark = false; }
    }
    root.classList.toggle('bcx-theme-dark', !!dark);
    root.classList.toggle('bcx-theme-light', !dark);
    root.classList.toggle('bcx-space', location.hostname.indexOf('space.bilibili.com') >= 0);

    var tg = document.getElementById('bcx-theme-toggle');
    if (tg) {
      tg.innerHTML = '<span aria-hidden="true">' + (dark ? '☀' : '☾') + '</span><span>' + (dark ? '深色' : '浅色') + '</span>';
    }

    /* 鼠标光晕：颜色留空 = 跟随主题（深色白 / 浅色黑），强度 0~100 */
    var curColor = state.cursorGlowColor;
    if (!curColor) curColor = dark ? '#FFFFFF' : '#000000';
    var strength = Number(state.cursorGlowStrength);
    if (!isFinite(strength)) strength = 28;
    strength = Math.max(0, Math.min(100, strength));
    root.style.setProperty('--bcx-cursor-glow-rgb', hexToRgb(curColor));
    root.style.setProperty('--bcx-cursor-alpha', String(strength / 100));
    root.style.setProperty('--bcx-logo-glow-rgb', hexToRgb(state.logoGlowColor));
  }

  function hexToRgb(hex) {
    var m = /^#?([0-9a-fA-F]{6})$/.exec(String(hex || ''));
    if (!m) return '251,114,153';
    var n = parseInt(m[1], 16);
    return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
  }

  function cycleTheme() {
    var isDark = root.classList.contains('bcx-theme-dark');
    var next = isDark ? 'light' : 'dark';
    state.theme = next;
    try { chrome.storage.sync.set({ theme: next }); } catch (e) { /* 忽略 */ }
    paint();
  }

  function isHomePage() {
    return location.pathname === '/' || location.pathname === '';
  }

  /* 收藏夹页：space.bilibili.com/<mid>/favlist */
  function isFavPage() {
    return location.hostname.indexOf('space.bilibili.com') >= 0 && location.pathname.indexOf('/favlist') >= 0;
  }

  /* 把「锚点上方」的所有块隐藏掉（横幅/头像/导航条/收藏夹大标题卡） */
  function hideAbove(anchor) {
    if (!anchor) return;
    var baseTop = anchor.getBoundingClientRect().top + window.pageYOffset;
    var node = anchor;
    while (node && node !== document.body && node.parentElement) {
      var sibs = node.parentElement.children;
      for (var i = 0; i < sibs.length; i++) {
        var s = sibs[i];
        if (s === node) continue;
        var tag = s.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'TEMPLATE') continue;
        if (s.id && s.id.indexOf('bcx-') === 0) continue;
        /* 顶栏保留，方便回首页/搜索 */
        if (s.matches && s.matches('.bili-header, #biliMainHeader, .space-float')) continue;
        var r = s.getBoundingClientRect();
        if (r.height > 0 && r.top + window.pageYOffset < baseTop - 4) {
          s.classList.add('bcx-fav-hidden');
        }
      }
      node = node.parentElement;
    }
  }

  function applyFavClean() {
    if (!state.favClean || !isFavPage()) {
      var old = document.querySelectorAll('.bcx-fav-hidden');
      for (var i = 0; i < old.length; i++) old[i].classList.remove('bcx-fav-hidden');
      return;
    }
    /* 保留左侧收藏夹目录，从它和视频区往上找需要隐藏的块 */
    var aside = document.querySelector('.favlist-aside');
    var grid = document.querySelector('.fav-content') || document.querySelector('.fav-list-main');
    var anchor = aside || grid;
    if (anchor) hideAbove(anchor);
    /* 收藏夹大标题卡（封面 + 默认收藏夹 + 播放全部 + 批量操作） */
    var info = document.querySelector('.favlist-info');
    if (info) info.classList.add('bcx-fav-hidden');
  }

  /* ---------- 首页：只留顶栏（搜索框），其余同级节点全隐藏 ---------- */
  function applyHomeOnly() {
    if (!state.homeOnly || !isHomePage()) {
      var old = document.querySelectorAll('.bcx-home-hidden');
      for (var i = 0; i < old.length; i++) old[i].classList.remove('bcx-home-hidden');
      return;
    }
    var header = document.querySelector('.bili-header') || document.querySelector('#biliMainHeader');
    if (!header) return;
    /* 大屏版顶栏是给深色 banner 配的白字白 logo，banner 去掉后要切回 mini 款（深色 logo） */
    try {
      if (!header.getAttribute('data-bcx-mini')) {
        header.setAttribute('data-bcx-mini', header.className);
        header.classList.remove('bili-header--large');
        header.classList.add('bili-header--mini');
      }
    } catch (e) { /* 忽略 */ }
    var KEEP = '.left-entry, .right-entry, .search-center, .bili-header__bar, .left-entry-main, .right-entry__main';
    var node = header;
    while (node && node.parentElement && node !== document.body) {
      var sibs = node.parentElement.children;
      for (var j = 0; j < sibs.length; j++) {
        var s = sibs[j];
        if (s === node) continue;
        var tag = s.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'TEMPLATE') continue;
        /* 自己注入的元素（居中 logo + 搜索框）不能被自己藏掉 */
        if (s.id && s.id.indexOf('bcx-') === 0) continue;
        /* 顶栏的组成部分（logo/首页/搜索/头像）永远不隐藏 */
        try {
          if (s.matches(KEEP) || s.querySelector(KEEP)) continue;
        } catch (e) { /* 忽略 */ }
        s.classList.add('bcx-home-hidden');
      }
      node = node.parentElement;
    }
  }

  function load() {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        paint();
        return;
      }
      chrome.storage.sync.get(DEFAULTS, function (v) {
        if (chrome.runtime.lastError) { paint(); return; }
        Object.assign(state, v || {});
        /* 兼容旧版单一 glowColor 设置 */
        if (v && v.glowColor) {
          if (!v.logoGlowColor) state.logoGlowColor = v.glowColor;
          if (!v.cursorGlowColor) state.cursorGlowColor = v.glowColor;
        }
        paint();
        appliedWidth = 0;
        syncWide();
      });
    } catch (e) {
      note('load:' + (e && e.message));
      paint();
    }
  }

  /* ---------- 右栏兜底标记 ---------- */
  function markRight() {
    var wrap = document.querySelector('.video-container-v1');
    if (!wrap) return;
    var kids = wrap.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el.classList.contains('left-container')) continue;
      if (el.classList.contains('right-container')) continue; /* 右栏自己单独处理（留 UP 主卡） */
      el.classList.add('bcx-detected-right');
    }
  }

  /* 右栏只剩 UP 主卡：只在视频右侧真的有空位时才摆出来，窄窗口直接隐藏，绝不压到画面 */
  function placeUpPanel() {
    var rc = document.querySelector('.right-container');
    if (!rc || !state.hideRight) return;
    var pw = document.getElementById('playerWrap');
    var box = document.querySelector('.video-container-v1');
    if (!pw || !box) return;

    var wideOn = root.classList.contains('bcx-wide');
    var pr = pw.getBoundingClientRect();
    var space = Math.floor(window.innerWidth - pr.right - 14); /* 播放器右边到窗口边缘的余量 */

    if (wideOn || space < 200) {
      rc.classList.add('bcx-up-hidden');
      return;
    }
    rc.classList.remove('bcx-up-hidden');

    /* 整栏按剩余空间等比缩放（内容按 350px 设计），保证永远不压到画面 */
    var w = Math.min(350, space - 8);
    rc.style.setProperty('width', w + 'px', 'important');
    rc.style.setProperty('right', '6px', 'important');

    var up = rc.querySelector('.up-panel-container');
    if (up) {
      up.style.removeProperty('width');
      up.style.removeProperty('transform');
      up.style.removeProperty('transform-origin');
    }
    var inner = rc.querySelector('.right-container-inner');
    if (inner) {
      var scale = Math.max(0.6, Math.min(1, w / 350));
      inner.style.setProperty('width', '350px', 'important');
      inner.style.setProperty('transform', 'scale(' + scale + ')', 'important');
      inner.style.setProperty('transform-origin', 'top left', 'important');
    }

    var top = Math.round(pr.top - box.getBoundingClientRect().top);
    if (top < 0) top = 0;
    rc.style.setProperty('top', top + 'px', 'important');
  }

  /* ---------- 全屏 / 网页全屏 / 小窗 ---------- */
  function specialScreen() {
    try {
      if (document.fullscreenElement) return true;
      var pc = document.querySelector('.bpx-player-container[data-screen]');
      if (pc) {
        var mode = pc.getAttribute('data-screen');
        if (mode && mode !== 'normal') return true;
      }
      var p = document.getElementById('bilibili-player');
      if (p && /(fullscreen|web-?full)/i.test(p.className || '')) return true;
    } catch (e) { /* 忽略 */ }
    return false;
  }

  function watchScreenMode() {
    var pc = document.querySelector('.bpx-player-container');
    if (!pc || pc.__bcxWatched) return;
    pc.__bcxWatched = true;
    try {
      new MutationObserver(function () {
        appliedWidth = 0;
        syncWide();
      }).observe(pc, { attributes: true, attributeFilter: ['data-screen'] });
    } catch (e) { /* 忽略 */ }
  }

  function clearSizes() {
    var player = document.getElementById('bilibili-player');
    var wrap = document.getElementById('playerWrap');
    var left = document.querySelector('.video-container-v1 > .left-container');
    if (left) left.style.removeProperty('width');
    if (player) {
      player.style.removeProperty('width');
      player.style.removeProperty('height');
    }
    if (wrap) wrap.style.removeProperty('height');
    appliedWidth = 0;
  }

  /* ---------- 放大播放器 ---------- */
  function syncWide() {
    if (!state.wide || !state.hideRight || specialScreen()) {
      clearSizes();
      return;
    }

    var box = document.querySelector('.video-container-v1');
    var left = box ? box.querySelector('.left-container') : null;
    var player = document.getElementById('bilibili-player');
    var wrap = document.getElementById('playerWrap');
    if (!box || !left || !player) return;

    var bar = window.innerWidth > 1680 ? 56 : 46;
    var avail = Math.round(box.getBoundingClientRect().width) - 20;

    var topInPage = wrap
      ? wrap.getBoundingClientRect().top + window.pageYOffset
      : box.getBoundingClientRect().top + window.pageYOffset + 40;
    var roomH = Math.max(320, window.innerHeight - topInPage - 24);
    var cap = Math.round(((roomH - bar) * 16) / 9);

    var target = Math.max(320, Math.min(avail, cap));
    if (Math.abs(appliedWidth - target) < 4) return;

    var h = Math.round((target * 9) / 16) + bar;

    appliedWidth = target;
    left.style.setProperty('width', target + 'px', 'important');
    player.style.setProperty('width', target + 'px', 'important');
    player.style.setProperty('height', h + 'px', 'important');
    if (wrap) wrap.style.setProperty('height', h + 'px', 'important');

    window.dispatchEvent(new Event('resize'));
  }

  /* ---------- 首页：Google 式的居中 logo + 搜索框 ---------- */
  function renderHero() {
    var hero = document.getElementById('bcx-hero');
    if (!state.homeOnly || !isHomePage()) {
      if (hero) hero.parentNode.removeChild(hero);
      var oldToggle = document.getElementById('bcx-theme-toggle');
      if (oldToggle) oldToggle.parentNode.removeChild(oldToggle);
      return;
    }
    if (hero) return;
    if (!document.body) return;

    hero = document.createElement('div');
    hero.id = 'bcx-hero';
    var mid = '';
    try {
      var m = document.cookie.match(/(?:^|;\s*)DedeUserID=(\d+)/);
      if (m) mid = m[1];
      if (!mid) {
        var a = document.querySelector('.right-entry a[href*="space.bilibili.com"], .bili-header a[href*="space.bilibili.com/"]');
        if (a) {
          var mm = a.getAttribute('href').match(/space\.bilibili\.com\/(\d+)/);
          if (mm) mid = mm[1];
        }
      }
    } catch (e) { /* 忽略 */ }
    var chips = mid
      ? '<div class="bcx-links"><a class="bcx-chip" href="https://space.bilibili.com/' + mid + '/favlist">★ 我的收藏夹</a></div>'
      : '';
    hero.innerHTML =
      '<div class="bcx-logo"><span>bilibili</span></div>' +
      '<div class="bcx-searchwrap">' +
      '<form class="bcx-search" action="https://search.bilibili.com/all" method="get" role="search">' +
      '<input type="text" name="keyword" placeholder="搜索 B 站" autocomplete="off" spellcheck="false">' +
      '<button type="submit" title="搜索" aria-label="搜索">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4.2-4.2"></path></svg>' +
      '</button></form>' +
      '<div id="bcx-hist" hidden></div>' +
      '</div>' + chips;
    document.body.appendChild(hero);

    /* 搜索历史（本地记录，点搜索框弹出） */
    (function bindHistory() {
      var input = hero.querySelector('input');
      var box = hero.querySelector('#bcx-hist');
      var form = hero.querySelector('form');

      function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
      }

      function show(list) {
        if (!list || !list.length) {
          box.innerHTML = '<div class="hist-head"><span>搜索历史</span></div>' +
            '<div class="hist-empty">还没有记录，在这搜一次就会记下来</div>';
          box.hidden = false;
          return;
        }
        box.innerHTML = '<div class="hist-head"><span>搜索历史</span>' +
          '<button type="button" class="hist-clear">清空</button></div>' +
          '<div class="hist-items">' + list.map(function (k) {
            return '<button type="button" class="hist-item">' + esc(k) + '</button>';
          }).join('') + '</div>';
        box.hidden = false;
      }

      function load() {
        try {
          chrome.storage.local.get({ bcxHistory: [] }, function (v) {
            show((v && v.bcxHistory) || []);
          });
        } catch (e) { /* 忽略 */ }
      }

      function save(kw) {
        kw = String(kw || '').trim();
        if (!kw) return;
        try {
          chrome.storage.local.get({ bcxHistory: [] }, function (v) {
            var list = (v && v.bcxHistory) || [];
            list = list.filter(function (x) { return x !== kw; });
            list.unshift(kw);
            chrome.storage.local.set({ bcxHistory: list.slice(0, 8) });
          });
        } catch (e) { /* 忽略 */ }
      }

      if (input) {
        /* 页面打开时是我们自己 focus 的，那一次不弹面板；之后用户点/聚焦才弹 */
        var allowOpen = false;
        setTimeout(function () { allowOpen = true; }, 600);
        input.addEventListener('focus', function () { if (allowOpen) load(); });
        input.addEventListener('click', function () { allowOpen = true; load(); });
        input.addEventListener('blur', function () {
          setTimeout(function () { if (box) box.hidden = true; }, 180);
        });
      }

      if (form) {
        form.addEventListener('submit', function () {
          save(input ? input.value : '');
          if (box) box.hidden = true;
        });
      }

      if (box) {
        box.addEventListener('click', function (e) {
          var clear = e.target && e.target.classList && e.target.classList.contains('hist-clear');
          if (clear) {
            try { chrome.storage.local.set({ bcxHistory: [] }); } catch (e) { /* 忽略 */ }
            box.hidden = true;
            return;
          }
          var item = e.target;
          while (item && item !== box && !(item.classList && item.classList.contains('hist-item'))) item = item.parentNode;
          if (item && item !== box && input && form) {
            input.value = item.textContent || '';
            form.submit();
          }
        });
      }

      /* 点搜索框以外的地方就收起（#bcx-hero 是全屏的，不能只判断 hero） */
      document.addEventListener('mousedown', function (e) {
        var wrap = hero.querySelector('.bcx-searchwrap');
        if (box && wrap && !wrap.contains(e.target)) box.hidden = true;
      });
    })();

    var logo = hero.querySelector('.bcx-logo');
    var logoImg = document.createElement('img');
    logoImg.alt = 'bilibili';
    logoImg.src = 'data:image/svg+xml;base64,' + LOGO_SVG_B64;
    logo.innerHTML = '';
    logo.appendChild(logoImg);

    /* 左下角主题切换 */
    var toggle = document.createElement('button');
    toggle.id = 'bcx-theme-toggle';
    toggle.type = 'button';
    toggle.title = '切换深色 / 浅色';
    toggle.addEventListener('click', cycleTheme);
    document.body.appendChild(toggle);
    paint();

    /* 鼠标跟随光晕（全站生效，单独管理） */
    ensureGlow();

    var input = hero.querySelector('input');
    if (input) {
      try { input.focus({ preventScroll: true }); } catch (e) { /* 忽略 */ }
    }
  }

  /* ---------- 鼠标跟随光晕：所有页面都挂一个 ---------- */
  function ensureGlow() {
    var strength = Number(state.cursorGlowStrength);
    if (!isFinite(strength) || strength <= 0) {
      var off = document.getElementById('bcx-glow');
      if (off) off.parentNode.removeChild(off);
      return;
    }
    if (!document.body) return;
    if (!document.getElementById('bcx-glow')) {
      var g = document.createElement('div');
      g.id = 'bcx-glow';
      g.style.transform = 'translate(-200px,-200px)';
      document.body.appendChild(g);
    }
    if (!window.__bcxGlowBound) {
      window.__bcxGlowBound = true;
      document.addEventListener('mousemove', function (e) {
        var el = document.getElementById('bcx-glow');
        if (el) el.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
      }, { passive: true });
    }
  }

  /* 全站搜索框瘦身：删热搜/轮播提示词，历史记录留着 */
  function applySearchClean() {
    /* 1) 轮播的灰字提示（B 站会反复改 placeholder，这里清掉） */
    var inputs = document.querySelectorAll('input.nav-search-input, input[class*="search"]');
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].placeholder) inputs[i].placeholder = '';
    }

    /* 2) 热搜块（已知类名 .trending）+ 文本兜底 */
    var trends = document.querySelectorAll('.nav-search-panel .trending, .search-panel .trending');
    for (var t = 0; t < trends.length; t++) trends[t].classList.add('bcx-hot-hidden');

    var panels = document.querySelectorAll('[class*="search-panel"], [class*="searchPanel"]');
    for (var p = 0; p < panels.length; p++) {
      var kids = panels[p].children;
      for (var k = 0; k < kids.length; k++) {
        var el = kids[k];
        if (el.classList && el.classList.contains('trending')) continue;
        var txt = el.textContent || '';
        var isHot = txt.indexOf('热搜') >= 0 || txt.indexOf('热榜') >= 0;
        var isHistory = txt.indexOf('历史') >= 0;
        if (isHot && !isHistory) el.classList.add('bcx-hot-hidden');
      }
    }
  }

  /* 面板是新插进来的，用 MutationObserver 立刻处理，避免"先闪一下再消失" */
  function watchSearchPanel() {
    if (window.__bcxPanelWatched) return;
    window.__bcxPanelWatched = true;
    try {
      var timer = null;
      new MutationObserver(function () {
        if (timer) return;
        timer = setTimeout(function () {
          timer = null;
          applySearchClean();
        }, 60);
      }).observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) { /* 忽略 */ }
  }

  /* 只要你在 B 站搜过（含搜索页 URL 里的 keyword），就自动记进历史 */
  function captureSearchKeyword() {
    try {
      if (location.hostname.indexOf('search.bilibili.com') < 0) return;
      var m = location.search.match(/[?&]keyword=([^&]*)/);
      if (!m || !m[1]) return;
      var kw = decodeURIComponent(m[1].replace(/\+/g, ' ')).trim();
      if (!kw || kw.length > 60 || kw === window.__bcxLastKw) return;
      window.__bcxLastKw = kw;
      chrome.storage.local.get({ bcxHistory: [] }, function (v) {
        var list = (v && v.bcxHistory) || [];
        if (list[0] === kw) return;
        list = list.filter(function (x) { return x !== kw; });
        list.unshift(kw);
        chrome.storage.local.set({ bcxHistory: list.slice(0, 8) });
      });
    } catch (e) { /* 忽略 */ }
  }

  function tick() {
    try {
      ensureStyle();
      paint();
      ensureGlow();
      applySearchClean();
      captureSearchKeyword();
      watchSearchPanel();
      applyHomeOnly();
      renderHero();
      applyFavClean();
      markRight();
      placeUpPanel();
      watchScreenMode();
      syncWide();
    } catch (e) {
      note('tick:' + (e && e.message));
    }
  }

  try {
    setInterval(tick, 1000);

    document.addEventListener('DOMContentLoaded', tick);
    window.addEventListener('load', tick);
    window.addEventListener('resize', function () {
      appliedWidth = 0;
      syncWide();
    }, { passive: true });
    document.addEventListener('fullscreenchange', function () {
      appliedWidth = 0;
      syncWide();
    });

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync' && area !== 'local') return;
        load();
      });
    }

    /* 系统深浅色变化时，auto 模式下跟着变 */
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (state.theme === 'auto') paint();
      });
    } catch (e) { /* 忽略 */ }

    paint();
    ensureStyle();
    load();
    applyHomeOnly();
    renderHero();
  } catch (e) {
    note('init:' + (e && e.message));
  }
})();

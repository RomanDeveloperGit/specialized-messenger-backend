<!--
# TODO: изменить флоу
# 1. проверка всех линтеров + запуска в прод режиме
# 2. обновление версии релиза
# 3. публикация npm
-->


Flow:
1. Push something to master
2. Autostart "update-release-version.yml" workflow
3. After this, autostart "publish-npm-package"

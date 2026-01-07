
import logging
import importlib
from typing import Any, Dict

# Версия пакета
__version__ = "0.1.0"

# Базовый логер
logger = logging.getLogger(__name__)

# Глобальная инициализация проекта (модули внутри корневого пакета)
def _initialize_core():
    try:
        # Пример: инициализируем воркеры/сигналы или другие модули
        # Импортируйте модули только для их эффекта инициализации
        importlib.import_module(".core.signals", __name__)
        importlib.import_module(".core.workers", __name__)
        logger.info("Core modules initialized successfully.")
    except Exception as e:
        # Не ломаем импорт пакета, но логируем проблему
        logger.exception("Failed to initialize core modules: %s", e)

# Вызываем инициализацию при импорте пакета
_initialize_core()

# Определяем list exportable API
__all__ = [
    "get_api",
    "ApiEndpoint",
    # добавляйте имена классов/функций, которые хотите экспортировать напрямую
]

# Lazy import API
def _lazy_api_import(name: str) -> Any:
    module_map: Dict[str, str] = {
        "get_api": "api.endpoints",
        "ApiEndpoint": "api.endpoints",
    }
    if name not in module_map:
        raise AttributeError(f"{name} not found in {__name__}")

    module_path = module_map[name]
    module = importlib.import_module(f".{module_path}", __name__)
    # если экспортируемая сущность находится в модуле, вернем её
    obj = getattr(module, name, None)
    if obj is None:
        # возможно, нужно вернуть модуль целиком
        obj = module
    globals()[name] = obj  # кешируем локально
    return obj

def __getattr__(name: str) -> Any:
    if name in __all__:
        return _lazy_api_import(name)
    raise AttributeError(f"module {__name__} has no attribute {name}")

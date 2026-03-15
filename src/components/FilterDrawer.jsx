import React from "react";
import { FiX } from "react-icons/fi";

const FilterDrawer = ({
    isOpen,
    onClose,
    category,
    setCategory,
    categories = [],
    onClearFilters,
    children,
}) => {
    return (
        <>
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-dark-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col">
                    <div className="p-5 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Filters
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
                        >
                            <FiX className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {Array.isArray(categories) &&
                                    categories.map((cat) => {
                                        const value = typeof cat === "string" ? cat : cat.name || cat.slug || cat._id || cat;
                                        return (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>
                        {children}
                    </div>

                    <div className="p-5 border-t border-gray-200 dark:border-dark-700">
                        <button
                            onClick={onClearFilters}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}
        </>
    );
};

export default FilterDrawer;
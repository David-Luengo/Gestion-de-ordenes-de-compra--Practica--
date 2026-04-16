export default function Paginator({
  currentPage,
  setCurrentPage,
  totalPageCount,
}) {
  return (
    <>
      <div className="flex justify-center mt-3">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          className="border border-gray-300 mr-2 rounded-md hover:bg-gray-200 text-gray-400 py-2 px-3 mb-10 shadow-md"
        >
          {"<"}
        </button>

        <div>
          <input
            type="number"
            value={currentPage}
            onChange={(ev) => {
              setCurrentPage(parseInt(ev.target.value));
            }}
            className="border border-gray-300 rounded-md hover:bg-gray-50 text-gray-400 py-2 px-3 mb-10 shadow-md"
            style={{ width: "70px" }}
          />
        </div>

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          className="border border-gray-300 ml-2 rounded-md hover:bg-gray-200 text-gray-400 py-2 px-3 mb-10 shadow-md"
        >
          {">"}
        </button>
      </div>
      <div className="flex justify-center -mt-6">
        <p className="text-gray-400">
          Página {currentPage} de {totalPageCount}
        </p>
      </div>
    </>
  );
}

import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";

function App() {
  const [unpaidProducts, setUnpaidProducts] = useState([]); // Danh sách sản phẩm chưa thanh toán
  const [apiCalled, setApiCalled] = useState(false); // Đánh dấu API đã được gọi

  useEffect(() => {
    const sock = new SockJS("http://localhost:8091/echo");

    sock.onopen = () => {
      console.log("Kết nối thành công với server!");
    };

    sock.onmessage = (event) => {
      try {
        const productData = JSON.parse(event.data);
        handleProductDetection(productData);
      } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu từ server:", error);
      }
    };

    sock.onclose = () => {
      console.log("Đã ngắt kết nối với server");
    };

    return () => {
      sock.close();
    };
  }, []);

  const callToggleApi = async () => {
    try {
      const response = await fetch("http://192.168.1.44/toggle?led=2", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
      });
      if (!response.ok) {
        throw new Error("Không thể gọi API toggle LED");
      }
      console.log("API toggle LED đã được gọi thành công");
    } catch (error) {
      console.error("Lỗi khi gọi API toggle LED:", error);
    }
  };

  const handleProductDetection = (productData) => {
    const { epc, name, isCheckout } = productData;

    if (!isCheckout) {
      setUnpaidProducts((prevUnpaidProducts) => {
        // Kiểm tra xem EPC đã tồn tại trong danh sách hay chưa
        const exists = prevUnpaidProducts.some(
          (product) => product.epc === epc
        );

        if (!exists) {
          // Gọi API toggle LED nếu chưa gọi
          if (!apiCalled) {
            callToggleApi();
            setApiCalled(true); // Đánh dấu đã gọi API
          }

          // Thêm sản phẩm mới vào danh sách
          return [...prevUnpaidProducts, productData];
        } else {
          console.log(`Sản phẩm "${name}" đã tồn tại trong danh sách.`);
          return prevUnpaidProducts; // Không thay đổi danh sách
        }
      });
    }
  };

  const handleRefresh = () => {
    setUnpaidProducts([]); // Xóa danh sách sản phẩm chưa thanh toán
    callToggleApi(); // Gọi API khi làm mới
    setApiCalled(false); // Reset trạng thái gọi API
    console.log("Danh sách đã được làm mới.");
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <header>
        <h2 style={{ textAlign: "center", color: "#333" }}>
          Danh sách sản phẩm chưa thanh toán
        </h2>
        <button
          onClick={handleRefresh}
          style={{
            display: "block",
            margin: "20px auto",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Làm mới
        </button>
        {unpaidProducts.length > 0 ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                <th
                  style={{
                    width: "200px",
                    textAlign: "left",
                    padding: "10px",
                  }}
                >
                  Tên sản phẩm
                </th>
                <th
                  style={{
                    width: "150px",
                    textAlign: "left",
                    padding: "10px",
                  }}
                >
                  EPC
                </th>
              </tr>
            </thead>
            <tbody>
              {unpaidProducts.map((product, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #ccc",
                    backgroundColor: index % 2 === 0 ? "#f1f1f1" : "white",
                  }}
                >
                  <td style={{ textAlign: "left", padding: "10px" }}>
                    {product.name}
                  </td>
                  <td style={{ textAlign: "left", padding: "10px" }}>
                    {product.epc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Chưa có sản phẩm chưa thanh toán nào.
          </p>
        )}
      </header>
    </div>
  );
}

export default App;

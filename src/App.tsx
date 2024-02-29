import React, { useState } from 'react';

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // Read the contents of the file
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        parseXML(content);
      };
      reader.readAsText(file);
    }
  };

  const parseXML = (xmlContent) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    const cardsArray = Array.from(xmlDoc.getElementsByTagName('Cards')).map((cardNode) => {
      return {
        id: cardNode.getAttribute('CatID'),
        quantity: parseInt(cardNode.getAttribute('Quantity'), 10),
        sideboard: cardNode.getAttribute('Sideboard') === 'true',
      };
    });

    setParsedData(cardsArray);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your logic to handle the form submission with inputValue and parsedData
    console.log('Submitted:', inputValue, parsedData);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-gray-200 p-8 rounded-lg w-1/2 h-4/5">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <label className="block mb-4 flex-grow">
            Input:
            <div className="relative">
              <textarea
                className="border border-gray-300 p-2 w-full h-full resize-none block"
                placeholder="Enter something"
                value={inputValue}
                onChange={handleChange}
              ></textarea>
            </div>
          </label>
          <label className="block mb-4">
            Upload File:
            <input
              type="file"
              onChange={handleFileChange}
              className="border border-gray-300 p-2 w-full"
            />
          </label>
          {parsedData && (
            <div className="mb-4">
              <strong>Parsed Data:</strong>
              <pre>{JSON.stringify(parsedData, null, 2)}</pre>
            </div>
          )}
          <div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;

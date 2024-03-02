import React, { ChangeEvent, useState, useEffect } from 'react';

interface AppProps {}

interface Card {
  id: string;
  quantity: string;
  sideboard: string;
  image: string;
}

const App: React.FC<AppProps> = () => {
  const [cardsArray, setCardsArray] = useState<Card[]>([]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const fileContent = await readFile(file);
      const parsedCardsArray = parseXml(fileContent);
      setCardsArray(parsedCardsArray);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add additional logic for form submission if needed
    console.log(cardsArray);
  };

  useEffect(() => {
    // Debounce the API calls by 100ms for each card
    const debounceTimeouts: number[] = [];

    cardsArray.forEach((card) => {
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(`https://api.scryfall.com/cards/mtgo/${card.id}`);
          const data = await response.json();

          if (data.image_uris && data.image_uris.border_crop) {
            const updatedCardsArray = cardsArray.map((c) =>
              c.id === card.id ? { ...c, image: data.image_uris.border_crop } : c
            );
            setCardsArray(updatedCardsArray);
          }
        } catch (error) {
          console.error(`Error fetching data for card ${card.id}:`, error);
        }
      }, 100);

      debounceTimeouts.push(timeoutId);
    });

    // Clear timeouts on component unmount or when the cardsArray changes
    return () => {
      debounceTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [cardsArray]);

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Error reading file'));
        }
      };
      reader.readAsText(file);
    });
  };

  const parseXml = (xmlString: string): Card[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const cardNodes = xmlDoc.querySelectorAll('Cards');

    const parsedCardsArray: Card[] = [];

    cardNodes.forEach((cardNode) => {
      const card: Card = {
        id: cardNode.getAttribute('CatID') || '',
        quantity: cardNode.getAttribute('Quantity') || '',
        sideboard: cardNode.getAttribute('Sideboard') || '',
        image: '',
      };

      parsedCardsArray.push(card);
    });

    return parsedCardsArray;
  };

  return (
    <div className="container mx-auto my-8 p-8 border rounded-md bg-gray-200">
      <h1 className="text-2xl font-bold mb-4">File Upload App</h1>
      <form encType="multipart/form-data" onSubmit={handleFormSubmit}>
        <label htmlFor="fileInput" className="block mb-2">
          Choose a file:
        </label>
        <input
          type="file"
          id="fileInput"
          name="file"
          accept=".xml"
          className="mb-4"
          onChange={handleFileChange}
        />
        <br />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
      {/* You can display the parsed data or any other relevant UI elements here */}
      <div>
        <h2 className="text-xl font-bold mb-2">Parsed Cards:</h2>
        <ul>
          {cardsArray.map((card, index) => (
            <li key={index}>
              ID: {card.id}, Quantity: {card.quantity}, Sideboard: {card.sideboard}, Image: {card.image}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;

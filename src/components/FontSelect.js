import  { useState, useEffect } from 'react';
import './FontSelect.css'

const fonts = [
  'Open Sans', 'Playfair Display', 'Roboto', 'Montserrat', 'Lato',
  'Raleway', 'Oswald', 'Ubuntu', 'Source Sans Pro', 'PT Sans',
  'Merriweather', 'Nunito', 'Poppins', 'Work Sans', 'Fira Sans',
  'Quicksand', 'Inconsolata', 'Rubik', 'Cabin', 'Mukta',
  'Exo 2', 'Zilla Slab', 'Anton', 'Bebas Neue', 'Libre Baskerville',
  'Noto Sans', 'DM Sans', 'Signika', 'Assistant', 'Questrial',
  'Manrope', 'Karla', 'Hind', 'Titillium Web', 'Varela Round',
  'Asap', 'Mulish',
];

const FontSelect = ({ object, canvas }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(object.fontFamily || 'Montserrat');
  const [originalFont, setOriginalFont] = useState(object.fontFamily || 'Montserrat');

  useEffect(() => {
    const font = object?.fontFamily || 'Montserrat';
    setSelectedFont(font);
    setOriginalFont(font);
  }, [object]);

  const applyFont = (font) => {
    object.set('fontFamily', font);
    canvas.requestRenderAll();
  };

  const handleHover = (font) => {
    applyFont(font);
  };

  const handleClick = (font) => {
    setSelectedFont(font);
    setOriginalFont(font);
    applyFont(font);
    setDropdownOpen(false);
  };

  const handleLeave = () => {
    applyFont(originalFont);
  };

  return (
    <div className="font-select-container" onMouseLeave={handleLeave}>
      <button
        className="font-select-button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{ fontFamily: selectedFont }}
      >
        {selectedFont}
      </button>

      {dropdownOpen && (
        <ul className="font-dropdown">
          {fonts.map((font) => (
            <li
              key={font}
              style={{ fontFamily: font }}
              onMouseEnter={() => handleHover(font)}
              onClick={() => handleClick(font)}
            >
              {font}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FontSelect;

// MUI + Google Maps Places Autocomplete
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import parse from "autosuggest-highlight/parse";
import { debounce } from "@mui/material/utils";
import { useState, useEffect, useRef, useMemo } from "react";
// MUI
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Slider from "@mui/material/Slider";
// Get the lat and lng from the address
import { getGeocode, getLatLng } from "use-places-autocomplete";
// Kairos
import { useConnection } from "@/packages/providers";
//

//List value of categories, tags, and licenses
const categories = [
  { label: "展覽" },
  { label: "表演" },
  { label: "課程" },
  { label: "導覽" },
  { label: "工作坊" },
  { label: "黑客松" },
  { label: "座談" },
  { label: "親子" },
  { label: "節祭／展會／市集" },
  { label: "分享會／同好會／見面會" },
];
const tags = [
  { main: "視覺", sub: "繪畫" },
  { main: "視覺", sub: "裝置" },
  { main: "視覺", sub: "工藝" },
  { main: "視覺", sub: "雕塑" },
  { main: "視覺", sub: "攝影" },
  { main: "視覺", sub: "影像" },
  { main: "表演", sub: "馬戲" },
  { main: "表演", sub: "音樂劇（親子、百老匯）" },
  { main: "表演", sub: "戲曲（歌仔戲、南管、京劇）" },
  { main: "表演", sub: "現代戲劇" },
  { main: "表演", sub: "讀劇" },
  { main: "表演", sub: "音樂（搖滾、古典、電子、音像）" },
  { main: "表演", sub: "說唱（漫才、相聲、站立喜劇）" },
  { main: "表演", sub: "舞蹈（現代舞、舞踏、民俗）" },
  { main: "設計", sub: "平面" },
  { main: "設計", sub: "互動 ／媒體" },
  { main: "設計", sub: "時尚" },
  { main: "設計", sub: "建築" },
  { main: "設計", sub: "工業／商品" },
  { main: "電影", sub: "紀錄片" },
  { main: "電影", sub: "劇情片" },
  { main: "科技", sub: "區塊鏈" },
  { main: "科技", sub: "AI" },
  { main: "科技", sub: "VR／AR／MR" },
  { main: "書籍", sub: "小說" },
  { main: "書籍", sub: "詩歌" },
  { main: "書籍", sub: "散文" },
  { main: "書籍", sub: "漫畫" },
  { main: "文化", sub: "公益（社會運動、地方創生、慈善捐贈）" },
  { main: "文化", sub: "性別" },
  { main: "文化", sub: "語言" },
  { main: "文化", sub: "歷史" },
  { main: "文化", sub: "環境" },
  { main: "文化", sub: "動物" },
  { main: "科學", sub: "社會科學（經濟、政治、國際關係）" },
  { main: "科學", sub: "自然科學（天文、地理）" },
];
const licenses = [
  { label: "All rights reserved" },
  { label: "CC0 public (Public Domain)" },
  { label: "CC BY (Attribution)" },
  { label: "CC BY-SA (Attribution-ShareAlike)" },
];

// Custom styles for the file upload button and hide the input
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
const theme = createTheme({
  palette: {
    primary: {
      main: "rgba(0,0,0,0.87)",
    },
  },
});

// MUI + Google Maps Places Autocomplete
const GOOGLE_MAPS_API_KEY = `${process.env.GoogleMapsAPIKey}`;
function loadScript(src, position, id) {
  if (!position) {
    return;
  }
  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
}
const autocompleteService = { current: null };

export default function Mint() {
  // State variables for places autocomplete
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const loaded = useRef(false);
  // State variables for lat and lng
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  // Google autocomplete service
  if (typeof window !== "undefined" && !loaded.current) {
    if (!document.querySelector("#google-maps")) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector("head"),
        "google-maps"
      );
    }
    loaded.current = true;
  }

  const fetchPlacePredictions = useMemo(
    () =>
      debounce((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 400),
    []
  );

  // State variables for form
  let pinningMetadata = false;
  let mintingToken = false;
  const serverUrl = "http://localhost:3030";
  const contractAddress = "KT1Aq4wWmVanpQhq4TTfjZXB5AjFpx15iQMM";
  const contractId = 91040; //正式版kairos = 91087
  const { address, callcontract } = useConnection();
  const userAddress = address;
  const titleRef = useRef();
  const descriptionRef = useRef();
  // const fileRef = useRef();
  const walletRef = useRef();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [mintingTokenQty, setMintingTokenQty] = useState(1);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);
  const [walletAddress, setWalletAddress] = useState(``);
  const [file, setFile] = useState();

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  const upload = async (event) => {
    event.preventDefault();
    // Check if the Google Maps Places library is loaded
    if (!autocompleteService.current) {
      console.error("Google Maps Places library is not loaded yet");
      return;
    }
    try {
      pinningMetadata = true;
      // Create a new FormData instance
      const data = new FormData();

      // Append each form field to the FormData instance
      data.append("title", titleRef.current.value);
      data.append("description", descriptionRef.current.value);
      data.append("category", selectedCategory.label);

      //solve ugly data tags
      const transformedData = selectedTags.reduce((acc, { main, sub }) => {
        const mainFormatted =
          main.charAt(0).toUpperCase() + main.slice(1).toLowerCase();
        const subFormatted =
          sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase();
        acc[mainFormatted] = acc[mainFormatted]
          ? [...acc[mainFormatted], subFormatted]
          : [subFormatted];
        return acc;
      }, {});
      const beautyResult = Object.keys(transformedData).map((key) => ({
        [key]: transformedData[key],
      }));
      data.append("tags", JSON.stringify(beautyResult));

      // Append the lat and lng to the FormData instance
      const geolocation = [lat, lng];
      data.append("geolocation", geolocation);

      // Append the creator address to the FormData instance
      data.append("creator", userAddress);

      // Append the minter address to the FormData instance
      data.append("minter", contractAddress);

      // Append the minting tool to the FormData instance
      const mintingTool = "https://kairos-mint.art/mint";
      data.append("mintingTool", mintingTool);

      // Append the copyright to the FormData instance,
      data.append("rights", selectedLicense.label);

      // Append the royalties to the FormData instance
      const royalties = {
        decimals: 4,
        shares: { [userAddress]: royaltyPercentage * 100 },
      };
      data.append("royalties", royalties);

      // Append the file to the FormData instance
      // if (fileRef) {
      //   data.append("image", fileRef.current.files[0]);
      // }
      if (file) {
        data.append("image", file);
      }

      console.log(data);

      // Make a POST request to the server
      // const response = await fetch(`${serverUrl}/mint`, {
      //   method: "POST",
      //   headers: {
      //     "Access-Control-Allow-Origin": "*",
      //   },
      //   body: data,
      // });

      // // // Parse the JSON response
      // if (response) {
      //   const data = await response.json();
      //   console.log(data);
      //   if (
      //     data.status === true &&
      //     data.msg.metadataHash &&
      //     data.msg.imageHash
      //   ) {
      //     pinningMetadata = false;
      //     mintingToken = true;

      //     // Minting token
      //     console.log("Minting token...");

      //     const metadataHash = `ipfs://${data.msg.metadataHash}`;

      //     //quick test mint-factory
      //     //Editions
      //     const metadataHashes = [metadataHash];

      //     const creators = [userAddress];

      //     const contractCallDetails = {
      //       contractId: contractId,
      //       tokenQty: mintingTokenQty,
      //       creators: creators,
      //       tokens: metadataHashes,
      //     };

      //     console.log(mintingTokenQty);

      //     try {
      //       const opHash = await callcontract(contractCallDetails);
      //       console.log("Operation successful with hash:", opHash);
      //     } catch (error) {
      //       console.error("Error calling contract function:", error);
      //     }
      //   } else {
      //     throw "No IPFS hash";
      //   }
      // } else {
      //   throw "No response";
      // }
    } catch (error) {
      console.log(error);
    } finally {
      pinningMetadata = false;
      mintingToken = false;
    }
  };

  useEffect(() => {
    // Auto import wallet address to input field
    if (!userAddress) {
      return;
    }
    setWalletAddress(userAddress);

    // Google autocomplete service
    let active = true;
    if (!autocompleteService.current && window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }
    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }
    fetchPlacePredictions({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });
    return () => {
      active = false;
    };
  }, [value, inputValue, fetchPlacePredictions, userAddress]);

  return (
    <>
      <Container maxWidth="lg">
        <Box
          component="form"
          sx={{ "& > :not(style)": { m: 1, width: "25ch" } }}
          noValidate
          autoComplete="off"
        >
          <Box>
            <TextField
              inputRef={titleRef}
              id="title"
              label="Title"
              variant="standard"
              sx={{ width: 300 }}
            />
          </Box>
          <Box>
            <TextField
              id="description"
              inputRef={descriptionRef}
              label="Description"
              multiline
              maxRows={4}
              variant="standard"
              sx={{ width: 300 }}
            />
          </Box>
          <Box>
            <Autocomplete
              // disablePortal
              id="categoriy"
              options={categories}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.label === value.label
              }
              sx={{ width: 300 }}
              onChange={(event, newValue) => {
                setSelectedCategory(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Category" variant="standard" />
              )}
            />
          </Box>
          <Box>
            <Autocomplete
              multiple
              id="tag"
              options={tags}
              groupBy={(option) => option.main}
              getOptionLabel={(option) => option.sub}
              sx={{ width: 300 }}
              onChange={(event, newValue) => {
                setSelectedTags(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Tag" variant="standard" />
              )}
            />
          </Box>
          <Box>
            <Autocomplete
              id="google-place-geocode"
              sx={{ width: 300 }}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.description
              }
              filterOptions={(x) => x}
              options={options}
              autoComplete
              includeInputInList
              filterSelectedOptions
              value={value}
              noOptionsText="No locations"
              onChange={(event, newValue) => {
                setOptions(newValue ? [newValue, ...options] : options);
                setValue(newValue);
                // if there is an input value, get the lat and lng
                if (newValue) {
                  getGeocode({ address: newValue.description }).then(
                    (results) => {
                      const { lat, lng } = getLatLng(results[0]);
                      setLat(lat);
                      setLng(lng);
                    }
                  );
                } else if (newValue === null) {
                  setLat(null);
                  setLng(null);
                }
              }}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add a location"
                  fullWidth
                  variant="standard"
                />
              )}
              renderOption={(props, option) => {
                const matches =
                  option.structured_formatting.main_text_matched_substrings ||
                  [];

                const parts = parse(
                  option.structured_formatting.main_text,
                  matches.map((match) => [
                    match.offset,
                    match.offset + match.length,
                  ])
                );

                return (
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item sx={{ display: "flex", width: 44 }}>
                        <LocationOnIcon sx={{ color: "text.secondary" }} />
                      </Grid>
                      <Grid
                        item
                        sx={{
                          width: "calc(100% - 44px)",
                          wordWrap: "break-word",
                        }}
                      >
                        {parts.map((part, index) => (
                          <Box
                            key={index}
                            component="span"
                            sx={{
                              fontWeight: part.highlight ? "bold" : "regular",
                            }}
                          >
                            {part.text}
                          </Box>
                        ))}
                        <Typography variant="body2" color="text.secondary">
                          {option.structured_formatting.secondary_text}
                        </Typography>
                      </Grid>
                    </Grid>
                  </li>
                );
              }}
            />
          </Box>
          {/* // If the user selects a location, display the lat and lng */}
          <Box>
            {lat ? (
              <Box sx={{ width: 300 }}>
                <Box component="span">lat:{lat}</Box>
                <Box component="span" pl={1}>
                  lng:{lng}
                </Box>
              </Box>
            ) : null}
          </Box>
          <Box>
            <Autocomplete
              // disablePortal
              id="license"
              options={licenses}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.label === value.label
              }
              sx={{ width: 300 }}
              onChange={(event, newValue) => {
                setSelectedLicense(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="License" variant="standard" />
              )}
            />
          </Box>
          <Box>
            <TextField
              id="mintingTokenQty"
              label="Editions"
              type="number"
              sx={{ width: 300 }}
              InputLabelProps={{ shrink: true }}
              variant="standard"
              inputProps={{ min: 1 }}
              value={mintingTokenQty}
              onChange={(event) =>
                setMintingTokenQty(Number(event.target.value))
              }
            />
          </Box>
          <Box>
            <TextField
              id="royalty"
              label="Royalty"
              type="number"
              sx={{ width: 300 }}
              InputLabelProps={{ shrink: true }}
              variant="standard"
              inputProps={{ min: 10, max: 25 }}
              value={royaltyPercentage}
              onChange={(event) =>
                setRoyaltyPercentage(Number(event.target.value))
              }
            />
          </Box>
          <Box>
            <Box>
              <TextField
                inputRef={walletRef}
                id="walletAddress"
                label="walletAddress"
                variant="standard"
                sx={{ width: 300 }}
                value={walletAddress}
              />
            </Box>
          </Box>
          <Box>
            <ThemeProvider theme={theme}>
              <Button
                id="thumbnail"
                component="label"
                role={undefined}
                variant="outlined"
                tabIndex={-1}
              >
                Upload file
                <VisuallyHiddenInput
                  type="file"
                  // ref={fileRef}
                  onChange={handleChange}
                />
              </Button>
            </ThemeProvider>
            <Box>
              {file ? (
                <Box sx={{ width: 300 }}>
                  <Box component="span">{file.name}</Box>
                </Box>
              ) : null}
            </Box>
          </Box>
          <Box pt={6}>
            <ThemeProvider theme={theme}>
              <Button variant="contained" color="primary" onClick={upload}>
                Mint
              </Button>
            </ThemeProvider>
          </Box>
        </Box>
      </Container>
    </>
  );
}
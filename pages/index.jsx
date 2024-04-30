import { MainnetAPI } from "@/lib/api";
import { useGlobalContext } from "@/contexts/GlobalContext";
import { useTheme } from "@emotion/react";

/* Components */
import { Box, Container } from "@mui/material";

import KeyVisual from "@/components/homepage/keyVisual";
import FeatureBox from "@/components/homepage/featureBox";
import FadeOnScroll from "@/components/fadeOnScroll";
import GeneralTokenCardGrid from "@/components/GeneralTokenCardGrid";
import Marquee from "@/components/homepage/Marquee";

export default function Home({ data }) {
  const { isLanded } = useGlobalContext();
  const theme = useTheme();

  return (
    <>
      <Container maxWidth="lg">
        <KeyVisual />
      </Container>
        {isLanded &&
          <Container maxWidth="lg">
            <FeatureBox bgIndex={0} title="紀錄你的藝文活動！" description="每次參加活動，你都能拿到一份屬於該活動的在場證明。內容由創作者決定，可能是節目單、可能是練習的側拍、可能是海報主視覺。" />
            <FeatureBox bgIndex={1} title="與創作者建立連結" description="透過在場證明，創作者將知道誰最常參與過他們的活動。<br />同時，唯有持有在場證明者，可以對活動發表評論。" />
            <FeatureBox bgIndex={2} title="探索喜好" description="透過在場證明，所有人皆可以探索彼此的藝文活動路徑。身為參與者，你可能找到跟你喜好相近的同好；身為創作者，你可能找到將來的合作對象。" />
            <FeatureBox bgIndex={3} title="保有匿名性的開放" description="所有資料都公開於鏈上，所有 ID 都是錢包地址，<br />借助 web3 的技術達到安全、匿名但真實的開放資料。" />
          </Container>
        }
        {isLanded &&
          <Box sx={{
            mt: 35,
            mb: 15,
            transform: "rotateZ(5deg)"
          }}>
            <Marquee
              variant="h3"
              textTransform="uppercase"
              color="white"
              bgcolor={theme.palette.secondary.main}
              text="We now have 132 tokens, 3 creators, and 12 events in 10 categories. "
            />
          </Box>
        }
        {isLanded &&
          <Container maxWidth="lg">
            <FadeOnScroll onceonly>
              <GeneralTokenCardGrid data={data.tokens} />
            </FadeOnScroll>
          </Container>
        }
    </>
  );
}

export async function getStaticProps() {
  const [data] = await Promise.all([await MainnetAPI(`/fa2tokens?limit=24`)]);
  return {
    props: { data },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10, // In seconds
  };
}

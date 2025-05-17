import { DataProvider } from "@/components/AnnotationCanvas/DataContext";
import "./styles.scss";

export const metadata = {
  title: {
    default: "Data Processing Hub",
    template: "%s | Data Processing Hub",
  },
  description: "A hub for processing data",
};

// TODO: make a aside for images fetching
// TODO:

// const FolderID = "1AA8UCcJfSOo4h7wagO24ShEwJEVop43s";

const Index = async ({
  children,
  images,
  main,
}: Readonly<{
  children: React.ReactNode;
  images: React.ReactNode;
  main: React.ReactNode;
  params: { system: string };
}>) => {
  return (
    <DataProvider>
      <main>
        {images}
        {main}
      </main>
    </DataProvider>
  );
};
export default Index;

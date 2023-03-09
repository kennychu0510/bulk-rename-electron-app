import * as ReactDOM from 'react-dom';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Text, Button, Container, FileInput, Group, rem, useMantineTheme, Center, Input, TextInput, Grid, Title, Table, Checkbox } from '@mantine/core';
import { useInputState, useViewportSize } from '@mantine/hooks';
import { ArrowRight } from 'tabler-icons-react';

const container = document.getElementById('app');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

type IFile = {
  checked: boolean;
  file: string;
};

root.render(<App />);

function App() {
  const theme = useMantineTheme();

  const ref = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { height, width } = useViewportSize();
  const [files, setFiles] = useState<IFile[]>([]);
  const [prefix, setPrefix] = useInputState('');
  const [suffix, setSuffix] = useInputState('');
  const [replace, setReplace] = useInputState('');
  const [replaceWith, setReplaceWith] = useInputState('');

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.setAttribute('directory', '');
      ref.current.setAttribute('webkitdirectory', '');
    }
  }, [ref]);

  async function onSelectDirectory() {
    // ref.current?.click()
    //@ts-ignore
    const { selectedDir, files } = (await electronAPI.selectDir()) as any;
    inputRef.current!.value = selectedDir;
    setFiles(files.map((item: any) => ({ checked: true, file: item })));
  }

  async function onRename() {
    const filesToRename = files.filter(item => item.checked).map(item => ({
      old: item.file,
      new: renamedText(item.file)
    }))
    console.log(filesToRename)
    //@ts-ignore
    const result = await electronAPI.renameFiles({ filesToRename });
    // if (result.files) {
    //   setFiles(files.map((item: any) => ({ checked: true, file: item })));
    // }
  }

  function onItemCheckChange(index: number) {
    setFiles(files => {
      const updatedFiles = [...files]
      updatedFiles[index].checked = !updatedFiles[index].checked
      return updatedFiles
    })
  }

  function renamedText(fileName: string) {
    const output = `${prefix}${fileName}${suffix}`.replace(replace, replaceWith)
    return output
  }

  return (
    <div className='app'>
      <Container size={'md'} h={height} sx={{ flexDirection: 'column', display: 'flex', minWidth: '500px' }}>
        <Container display={'flex'} sx={{ justifyContent: 'space-between', width: '100%', marginBottom: 20, padding: 0, marginTop: 50 }}>
          <Button onClick={onSelectDirectory}>Select Directory</Button>
          <Button onClick={onRename} color={'green'}>
            Rename
          </Button>
        </Container>
        <Input.Wrapper label='Path' styles={{ label: { color: 'white' } }}>
          <Input ref={inputRef} placeholder={'Path of Directory'} sx={{ width: '100%' }} />
        </Input.Wrapper>
        <Input.Wrapper label='Prefix' styles={{ label: { color: 'white' } }} sx={{ marginTop: 20 }}>
          <Input placeholder='Prefix' value={prefix} onChange={setPrefix} />
        </Input.Wrapper>
        <Input.Wrapper label='Suffix' styles={{ label: { color: 'white' } }} sx={{ marginTop: 20 }}>
          <Input placeholder='Suffix' value={suffix} onChange={setSuffix} />
        </Input.Wrapper>
        <Input.Wrapper label='Replace' styles={{ label: { color: 'white' } }} sx={{ marginTop: 20 }}>
          <Input placeholder='Replace' value={replace} onChange={setReplace} />
        </Input.Wrapper>
        <Input.Wrapper label='Replace With' styles={{ label: { color: 'white' } }} sx={{ marginTop: 20 }}>
          <Input placeholder='Replace With' value={replaceWith} onChange={setReplaceWith} />
        </Input.Wrapper>
        <Title order={3} sx={{ margin: '20px 0 10px' }}>
          Files:
        </Title>
        <Container w={'100%'} p={0}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ flexGrow: 1 }}>
              <Title order={4}>Original</Title>
            </div>
            <div style={{ flexBasis: '5%' }}></div>
            <div style={{ flexGrow: 1 }}>
              <Title order={4}>After</Title>
            </div>
          </div>
          {files.map((file, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox sx={{ marginRight: 5 }} checked={file.checked} onChange={() => onItemCheckChange(idx)}/>
              <div style={{ width: '45%', wordWrap: 'break-word' }}>
                <Text>{file.file}</Text>
              </div>
              <div style={{ width: '30px' }}>
                <ArrowRight color='white' />
              </div>
              <div style={{ width: '45%', wordWrap: 'break-word' }}>
                {file.checked?
                <Text>{renamedText(file.file)}</Text>
                :
                <Text>{file.file}</Text>
                }
              </div>
            </div>
          ))}
        </Container>
      </Container>
    </div>
  );
}

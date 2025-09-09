import MarkdownFileList from '../components/MarkdownFileList';

const MarkdownViewerPage = () => {
  return (
    <div className="markdown-page-container">
      <h2 style={{ textAlign: 'center', margin: '2rem 0' }}>
        Markdown文件查看器
      </h2>
      <MarkdownFileList />
    </div>
  );
};

export default MarkdownViewerPage;
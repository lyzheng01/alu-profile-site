import '@testing-library/jest-dom';
import { PAGE_DESCRIPTIONS, PAGE_TITLES, setPageTitle } from './titleManager';

test('homepage and About metadata do not claim LingYe owns manufacturing facilities', () => {
  ['home', 'about'].forEach((page) => {
    expect(Object.values(PAGE_TITLES[page])).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/manufacturer|factory|fabricante|fábrica|مصنع|制造商|工厂/i)])
    );
    expect(Object.values(PAGE_DESCRIPTIONS[page])).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/manufacturer|factory-direct|fabricante|fábrica|制造商|自有工厂/i)])
    );
  });
});

test('setPageTitle uses the revised localized homepage metadata', () => {
  const description = document.createElement('meta');
  description.name = 'description';
  document.head.appendChild(description);
  setPageTitle('home', 'zh');
  expect(document.title).toBe('铝型材项目方案 | 凌烨铝业');
  expect(description.content).toBe('浏览建筑与工业铝型材参考，沟通图纸、表面处理和项目需求。');
  description.remove();
});

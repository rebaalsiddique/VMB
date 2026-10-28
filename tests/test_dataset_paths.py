from pathlib import Path

from src.ml.dataset_loader import resolve_dataset_path


def test_resolve_dataset_path_uses_repo_relative_location(tmp_path):
    dataset = tmp_path / 'Virtual_Mining_Blast_ML_Dataset.xlsx'
    dataset.write_bytes(b'not empty')

    resolved = Path(resolve_dataset_path(str(dataset)))

    assert resolved == dataset


def test_resolve_dataset_path_defaults_to_project_tree():
    resolved = Path(resolve_dataset_path())

    assert resolved.is_absolute()
    assert resolved.name in {'Virtual_Mining_Blast_ML_Dataset.xlsx', 'LOX_Blast_Raw_and_Assumed_Data.xlsx'}
    assert str(resolved).startswith(str(Path(__file__).resolve().parents[1]))
